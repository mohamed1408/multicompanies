import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import {
  NgbDateStruct,
  NgbCalendar,
  NgbDate,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { DenomEntry, Entry } from './denomination.module';
import { ExcelService } from '../services/excel/excel.service';
import * as _ from 'lodash';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-denominations',
  templateUrl: './denomination.component.html',
  styleUrls: ['./denomination.component.css'],
})
export class DenominationComponent implements OnInit {
  @ViewChild('copy_data_modal', { static: true })
  copy_data_modal!: ElementRef;
  @ViewChild('delet_confirmation_modal', { static: true })
  delet_confirmation_modal!: ElementRef;
  @ViewChild('denomReport', { static: true })
  denomReport!: ElementRef;
  @ViewChild('pettycashtransfermodal', { static: true })
  pettycashtransfermodal!: ElementRef;
  @ViewChild('denomcheckreportmodal', { static: true })
  denomcheckreportmodal!: ElementRef;

  model!: NgbDateStruct;
  companyid: number;
  stores: any = [];
  loginfo;
  storeid: number = 0;
  smodel = '';
  entrytypeid: number | null = null;
  date!: { year: number; month: number };
  entrytypes = [
    { id: null, type: 'All' },
    { id: 1, type: 'Send to Store' },
    { id: 2, type: 'Closing' },
  ];
  displaydate = moment().format('Do MMM YYYY');
  showcalender = false;
  denomentries: any[] = [];
  copydata = '';
  store_petty_cash: {
    cashSales: number;
    salescash: number;
    expensecash: number;
    fromSales: number | null;
    fromExpense: number | null;
    to: string;
    transferAmount: number;
    transferReason: string;
  } = {
    cashSales: 0,
    salescash: 0,
    expensecash: 0,
    fromSales: 0,
    fromExpense: 0,
    to: '',
    transferAmount: 0,
    transferReason: '',
  };
  shifts = [
    { shift: '08:00 am to 11:59 am', shiftid: 1 },
    { shift: '12:00 pm to 02:29 pm', shiftid: 2 },
    { shift: '02:30 pm to 04:29 pm', shiftid: 3 },
    { shift: '04:30 pm to 06:29 pm', shiftid: 4 },
    { shift: '06:30 pm to 08:30 pm', shiftid: 5 },
    { shift: '08:30 pm to closing ', shiftid: 6 },
  ];

  constructor(
    private auth: AuthService,
    private calendar: NgbCalendar,
    private modalService: NgbModal,
    private excelservice: ExcelService
  ) {
    this.loginfo = JSON.parse(localStorage.getItem('loginInfo') || '{}');
    this.companyid = this.loginfo.CompanyId;
  }
  companies: any[] = [];
  ngOnInit() {
    // this.auth.companies.subscribe((companies) => {
    //   this.companies = companies;
    //   if (!this.companies.some((x) => x.AccountId == 0)) {
    //     this.companies.unshift({
    //       AccountId: 0,
    //       AccountName: 'All',
    //       Address: '',
    //       CompanyId: 0,
    //       CompanyName: 'All Companies',
    //       Email: 'all@gmail.com',
    //       UserId: 149,
    //     });
    //     this.auth.companies.next(this.companies);
    //   }
    // });
    this.auth.companyid.subscribe((companyid) => {
      this.companyid = companyid;
      this.auth.isloading.next(true);
      this.getstores();
    });

    this.model = this.calendar.getToday();
    setHeightWidth();
    this.getDenominationTypes();
  }
  // ngOnDestroy() {
  //   console.log('destroying component ...');
  //   this.companies.shift();
  //   this.auth.companies.next(this.companies);
  //   // alert('destroying component ...');
  // }
  onDateSelect(date: NgbDate) {
    console.log(date);
    this.model = date;
    this.displaydate = moment(`${date.year}-${date.month}-${date.day}`).format(
      'Do MMM YYYY'
    );
    this.showcalender = false;
    // this.fetchEntries(`${date.year}-${date.month}-${date.day}`)
  }

  getstores() {
    this.auth.GetStores(this.companyid).subscribe((data: any) => {
      console.log(data);
      this.stores = data;
      this.auth.isloading.next(false);
    });
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      map((term) =>
        term === ''
          ? []
          : this.stores
              .filter(
                (v: any) =>
                  v.Name.toLowerCase().indexOf(term.toLowerCase()) > -1
              )
              .slice(0, 10)
      )
    );

  formatter = (x: { Name: string }) => x.Name;
  totalsales: any;
  selectedItem(store: any) {
    console.log(store);
    this.storeid = store.Id;
    this.loginfo.StoreId = this.storeid;
    this.getstorecashsales();
  }

  getstorecashsales() {
    this.auth
      .getstorecashsales(
        this.storeid,
        this.companyid,
        moment({ ...this.model, month: this.model.month - 1 }).format(
          'YYYY-MM-DD'
        )
      )
      .subscribe((data: any) => {
        console.log(data);
        this.totalsales = JSON.parse(JSON.stringify(data['totalsales'][0]));
        this.store_petty_cash = {
          cashSales: this.totalsales.cashsales,
          salescash: this.totalsales.salescash,
          expensecash: this.totalsales.expensecash,
          fromSales: 0,
          fromExpense: 0,
          to: '',
          transferAmount: 0,
          transferReason: '',
        };
      });
  }

  totalexcess = 0;
  totalshortage = 0;
  total = 0;
  copy_raw_data: Array<{
    store: string;
    user: string;
    remarks: string;
    time: string;
  }> = [];
  fetchdenomentries() {
    this.auth.isloading.next(true);
    this.totalexcess = 0;
    this.totalshortage = 0;
    this.total = 0;
    this.copy_raw_data = [
      { store: 'Store', user: 'User', remarks: 'Remarks', time: 'time' },
    ];
    var date = `${this.model.year}-${this.model.month}-${this.model.day}`;
    this.auth
      .fetchDenominationEntries(
        this.storeid,
        date,
        this.companyid,
        this.entrytypeid
      )
      .subscribe((data: any) => {
        console.log(data);
        this.denomentries = data['data'] || [];
        this.denomentries = this.denomentries.sort((a: any, b: any) => {
          return a.Id - b.Id;
        });
        var olddiff = 0;
        this.denomentries.forEach((dentry: any, index: number) => {
          dentry.edited = false;
          dentry.CashInTransaxns = dentry.CashInJson
            ? JSON.parse(dentry.CashInJson)
            : [];
          dentry.CashOutTransaxns = dentry.CashOutJson
            ? JSON.parse(dentry.CashOutJson)
            : [];
          dentry.SalesTransaxns = dentry.TransactionJson
            ? JSON.parse(dentry.TransactionJson).filter(
                (x: any) => x.PaymentTypeId != 7
              )
            : [];
          dentry.diff = dentry.TotalAmount - dentry.ExpectedBalance;
          dentry.Remarks =
            dentry.diff == 0
              ? 'Tallied'
              : dentry.diff > 0
              ? 'Excess'
              : 'Shortage';
          dentry.shift = this.shifts.filter(
            (x) => x.shiftid == dentry.ShiftId
          )[0].shift;
          console.log(dentry.TransactionJson);
          const PCT = JSON.parse(dentry.TransactionJson || '[]')
            .filter((x: any) => x.PaymentTypeId == 7)
            .map((x: any) => (x.TransTypeId == 1 ? x.Amount : x.Amount * -1))
            .reduce((a: any, b: any) => a + b, 0);
          dentry.PCT_FACTOR = [3, 4].includes(dentry.EntryTypeId)
            ? 1
            : [5, 6].includes(dentry.EntryTypeId)
            ? -1
            : 0;
          dentry.PCT = PCT * dentry.PCT_FACTOR;
          dentry.PCT_remark = `${dentry.PCT} ${
            dentry.PCT > 0 ? 'from' : 'to'
          } ${
            dentry.PCT_FACTOR > 0 ? 'Sales Petty Cash' : 'Expense Petty Cash'
          }`;
          dentry.PCT_IN = JSON.parse(dentry.TransactionJson || '[]')
            .filter(
              (x: any) =>
                x.PaymentTypeId == 7 &&
                x.TransTypeId == (dentry.PCT_FACTOR == 1 ? 1 : 2)
            )
            .map((x: any) => x.Amount)
            .reduce((a: any, b: any) => a + b, 0);
          dentry.PCT_OUT = JSON.parse(dentry.TransactionJson || '[]')
            .filter(
              (x: any) =>
                x.PaymentTypeId == 7 &&
                x.TransTypeId == (dentry.PCT_FACTOR == 1 ? 2 : 1)
            )
            .map((x: any) => x.Amount)
            .reduce((a: any, b: any) => a + b, 0);
          console.log(dentry);
          if (index > 0 && this.storeid > 0)
            dentry.compared_value = dentry.diff - olddiff;
          olddiff = dentry.diff;
          dentry.storename = this.stores.filter(
            (x: any) => x.Id == dentry.StoreId
          )[0].Name;
          if (this.denomentries.some((x: any) => x.EditedForId == dentry.Id)) {
            dentry.edited = true;
            dentry.editid = this.denomentries.filter(
              (x: any) => x.EditedForId == dentry.Id
            )[0].Id;
          } else {
            this.totalexcess += dentry.diff > 0 ? dentry.diff : 0;
            this.totalshortage += dentry.diff < 0 ? dentry.diff : 0;
          }
          var obj = {
            store: dentry.storename,
            user: dentry.UserName,
            remarks: dentry.diff + ' ' + dentry.Remarks,
            time: moment(dentry.EntryDateTime).format('HH:MM A'),
          };
          this.copy_raw_data.push(obj);
        });
        this.total = this.totalexcess + this.totalshortage;
        this.denomentries = this.denomentries.sort((a: any, b: any) => {
          return b.Id - a.Id;
        });
        this.auth.isloading.next(false);
      });
  }
  opencopymodal() {
    var max_store_len = 0;
    var max_user_len = 0;
    this.copy_raw_data.forEach((data: any) => {
      if (data.store.length > max_store_len) max_store_len = data.store.length;
      if (data.user.length > max_user_len) max_user_len = data.user.length;
    });
    max_store_len = max_store_len + 1;
    max_user_len = max_user_len + 1;
    this.copy_raw_data.forEach((data: any) => {
      if (data.store.length < max_store_len) {
        var diff = max_store_len - data.store.length;
        data.store = data.store + '-'.repeat(diff);
      }
      if (data.user.length < max_user_len) {
        var diff = max_user_len - data.user.length;
        data.user = data.user + '-'.repeat(diff);
      }
      this.copydata +=
        data.store + data.user + data.remarks + '--' + data.time + '\n\n';
    });
    this.modalService.open(this.copy_data_modal, {
      centered: true,
      size: 'lg',
      backdropClass: 'z-index-1',
    });
  }
  openconfirmdeletemodal(deleteid: number) {
    console.log(deleteid);
    this.delete_denom_id = deleteid;
    this.modalService.open(this.delet_confirmation_modal, {
      centered: true,
      size: 'sm',
      backdropClass: 'z-index-1',
    });
  }
  today: string = moment().format('YYYY-MM-DD');
  from: string = moment().subtract(60, 'minutes').format('hh:mm');
  to: string = moment().format('hh:mm');
  badStores: any[] = [];
  missingStores: any[] = [];
  badStoresString: string = '';
  missingStoresString: string = '';
  withDifference: boolean = false;
  diffMargin: number = 100;

  getDateFormated(time: any) {
    return moment(this.today + ' ' + time).format('YYYY-MM-DD hh:mm A');
  }

  getDenomReport() {
    // console.log(moment().format('HH:MM'), (moment().format('hh:mm')))
    // return
    this.auth
      .denomEntryReport(
        this.companyid,
        this.getDateFormated(this.from),
        this.getDateFormated(this.to),
        this.diffMargin
      )
      .subscribe((data: any) => {
        console.log(data);
        this.badStores = data['badStores'];
        this.missingStores = data['missingStores'];

        this.genBadStoresString();

        this.missingStoresString = this.missingStores
          .map((x: any) => x.Name)
          .join(' \n');

        this.modalService.open(this.denomReport, {
          centered: true,
          size: 'lg',
          backdropClass: 'z-index-1',
        });
      });
  }

  getLargestString(arr: any[]) {
    var largetsString = '';
    console.log(arr);
    arr.forEach((str) => {
      if (str.length > largetsString.length) {
        largetsString = str;
      }
    });
    return largetsString;
  }

  addPadding(totLen: number, string: string) {
    let extraLen = totLen - string.length;
    return string + ' '.repeat(extraLen);
  }

  changeshift(denomentryid: number, shiftid: number, i: number) {
    this.denomentries[i].loading = true;
    this.auth.changeshift(denomentryid, shiftid).subscribe((data) => {
      console.log(data);
      this.denomentries[i].loading = false;
      this.denomentries[i].dirty = false;
      this.denomentries[i].shift = this.shifts.filter(
        (x) => x.shiftid == shiftid
      )[0].shift;
    });
  }
  denomcheckreports: any[] = [];
  denomcheckreport() {
    var date = `${this.model.year}-${this.model.month}-${this.model.day}`;
    this.auth
      .denomcheckreport(this.companyid, date, date)
      .subscribe((data: any) => {
        console.log(data);
        this.denomcheckreports = data['report'];
        this.modalService.open(this.denomcheckreportmodal, {
          centered: true,
          size: 'lg',
          backdropClass: 'z-index-1',
        });
      });
  }

  diffString(diff: number) {
    let str = '';
    if (this.withDifference) {
      if (diff > 0) {
        str = '  -->  Shortage ' + diff;
      } else if (diff < 0) {
        str = '  -->  Excess ' + diff;
      } else if (diff == 0) {
        str = '  -->  ' + diff;
      }
    }
    return str;
  }

  genBadStoresString() {
    this.badStoresString = '';
    let largetstString = this.getLargestString(
      this.badStores.map((x: any) => x.Name)
    );
    this.badStores.forEach((bs) => {
      this.badStoresString +=
        this.addPadding(largetstString.length, bs.Name) +
        this.diffString(bs.diff) +
        '\n';
    });
  }

  openPettyCash() {
    this.modalService.open(this.pettycashtransfermodal, {
      centered: true,
      size: 'xl',
      backdropClass: 'z-index-1',
    });
  }

  transfer() {
    if (
      this.store_petty_cash.fromSales &&
      this.store_petty_cash.fromSales > 0
    ) {
      this.store_petty_cash.to = 'EXPENSE';
    } else if (this.store_petty_cash.fromExpense) {
      this.store_petty_cash.to = 'SALES';
    }
    console.log(JSON.stringify(this.store_petty_cash));
    this.store_petty_cash.transferAmount =
      (this.store_petty_cash.fromExpense || 0) +
      (this.store_petty_cash.fromSales || 0);

    this.store_petty_cash.salescash +=
      (this.store_petty_cash.fromExpense || 0) -
      (this.store_petty_cash.fromSales || 0);

    this.store_petty_cash.expensecash +=
      (this.store_petty_cash.fromSales || 0) -
      (this.store_petty_cash.fromExpense || 0);

    this.store_petty_cash.fromExpense = null;
    this.store_petty_cash.fromSales = null;
  }

  completeTransfer() {
    console.log(
      `Transfer amount of Rs.${this.store_petty_cash.transferAmount} from ${
        this.store_petty_cash.to == 'EXPENSE' ? 'Sales' : 'Expense'
      } cash to ${
        this.store_petty_cash.to == 'EXPENSE' ? 'Expense' : 'Sales'
      } cash`
    );
    console.log(this.store_petty_cash);
    this.auth
      .pettyCashTransfer(
        this.storeid,
        this.companyid,
        this.store_petty_cash.transferAmount,
        this.store_petty_cash.to,
        escape(this.store_petty_cash.transferReason)
      )
      .subscribe((data: any) => {
        console.log(data);
        this.getstorecashsales();
      });
    this.modalService.dismissAll();
  }

  cancelTransfer() {
    console.log('CANCEL TRANSFER');
    this.store_petty_cash = {
      cashSales: this.totalsales.cashsales,
      salescash: this.totalsales.salescash,
      expensecash: this.totalsales.expensecash,
      fromSales: null,
      fromExpense: null,
      to: '',
      transferAmount: 0,
      transferReason: '',
    };
  }
  visible: boolean = false;
  denomEntry!: DenomEntry;
  denominations!: string[];
  entrydatetime = {
    date: '',
    time: '',
  };

  calculate() {
    this.denomEntry.TotalAmount = 0;
    this.denomEntry.Entries.forEach((entry) => {
      entry.Amount = +entry.DenomName * (entry.Count || 0);
      this.denomEntry.TotalAmount += entry.Amount;
    });
  }

  getDenominationTypes() {
    this.auth.denominationTypes().subscribe((data: any) => {
      console.log(data);
      this.denominations = data;
    });
  }
  save() {
    console.log(this.entrydatetime);
    console.log(this.entrydatetime.date + 'T' + this.entrydatetime.time);
    console.log(
      moment(this.entrydatetime.date + 'T' + this.entrydatetime.time).format(
        'YYYY-MM-DD hh:mm A'
      )
    );
    // return;
    if (this.denomEntry.Entries.some((e: any) => e.Count > 0 && e.Amount > 0)) {
      if (this.denomEntry.EditedForId == null) {
        var date = moment().format('YYYY-MM-DD');
        this.auth
          .getstorecashsales(this.storeid, this.companyid, date)
          .subscribe((data: any) => {
            console.log(data);
            var cash_transaxns = data['totalsales'][0].cashsales;
            let salescash = data['totalsales'][0].salescash;
            let expensecash = data['totalsales'][0].expensecash;

            this.denomEntry.EntryDateTime = moment(
              this.entrydatetime.date + 'T' + this.entrydatetime.time
            ).format('YYYY-MM-DD hh:mm A');
            this.denomEntry.Entries = this.denomEntry.Entries.filter(
              (e: any) => e.Count > 0 && e.Amount > 0
            );
            console.log(this.model, moment(this.model).format('DD-MM-YYYY'));
            var _date = moment().format('DD-MM-YYYY');
            this.auth
              .dayclosing(this.companyid, this.storeid, _date, '13:51')
              .subscribe((dcdata: any) => {
                console.log(dcdata);
                this.denomEntry.OpeningBalance =
                  dcdata['closingTrans']['OpeningBalance'];
                this.denomEntry.CashIn = dcdata['CashIn'];

                this.denomEntry.CashOut = dcdata['CashOut'];
                if (
                  (this.denomEntry.EntryTypeId == 3 ||
                    this.denomEntry.EntryTypeId == 4) &&
                  dcdata['CashOut'] > 0
                ) {
                  this.denomEntry.CashOut =
                    dcdata['CashOut'] -
                    (dcdata['cashOutTrx'].filter(
                      (x: any) => x.TransTypeId == 10 && x.Amount > 0
                    )[0]
                      ? dcdata['cashOutTrx'].filter(
                          (x: any) => x.TransTypeId == 10 && x.Amount > 0
                        )[0].Amount
                      : 0 || 0);
                }
                let sent_store_index = -1;
                sent_store_index = dcdata['cashOutTrx'].filter((y: any) =>
                  y.TransactionId ==
                  dcdata['cashOutTrx'].filter(
                    (x: any) => x.TransTypeId == 10 && x.Amount > 0
                  )[0]
                    ? dcdata['cashOutTrx'].filter(
                        (x: any) => x.TransTypeId == 10 && x.Amount > 0
                      )[0].TransactionId
                    : 0 || 0
                );
                this.denomEntry.SalesCash = data['totalsales'][0].cashsales
                  ? data['totalsales'][0].cashsales
                  : 0;
                console.log(
                  this.denomEntry.OpeningBalance,
                  this.denomEntry.CashIn,
                  this.denomEntry.SalesCash,
                  this.denomEntry.CashOut
                );

                if (
                  this.denomEntry.EntryTypeId == 3 ||
                  this.denomEntry.EntryTypeId == 4
                ) {
                  this.denomEntry.ExpectedBalance =
                    this.denomEntry.CashIn +
                    (expensecash ? expensecash : 0) -
                    this.denomEntry.CashOut;
                  this.denomEntry.CashOutJson = JSON.stringify(
                    dcdata['cashOutTrx'].filter(
                      (x: any, i: number) => i != sent_store_index
                    )
                  );
                } else if (
                  this.denomEntry.EntryTypeId == 5 ||
                  this.denomEntry.EntryTypeId == 6
                ) {
                  console.log(
                    `formula openingsales(${
                      salescash ? salescash : 0
                    }) + salescash(${this.denomEntry.SalesCash})`
                  );
                  console.log(
                    (salescash ? salescash : 0) + this.denomEntry.SalesCash
                  );
                  this.denomEntry.ExpectedBalance =
                    (salescash ? salescash : 0) + this.denomEntry.SalesCash;
                  this.denomEntry.CashOutJson = JSON.stringify(
                    dcdata['cashOutTrx']
                  );
                } else {
                  this.denomEntry.ExpectedBalance =
                    this.denomEntry.OpeningBalance +
                    this.denomEntry.SalesCash -
                    this.denomEntry.CashOut;
                  this.denomEntry.CashOutJson = JSON.stringify(
                    dcdata['cashOutTrx']
                  );
                }

                this.denomEntry.CashInJson = JSON.stringify(
                  dcdata['cashInTrx']
                );
                this.denomEntry.TransactionJson = JSON.stringify(
                  data['transactions']
                );
                console.log(this.denomEntry);
                // return
                this.auth
                  .addDenomEntry(this.denomEntry)
                  .subscribe((data: any) => {
                    this.visible = false;
                    this.fetchdenomentries();
                  });
              });
          });
      } else {
        var parentEntry = this.denomentries.filter(
          (x: any) => x.Id == this.denomEntry.EditedForId
        )[0];
        console.log(parentEntry);
        this.denomEntry.EntryDateTime = moment().format('YYYY-MM-DD hh:mm A');
        this.denomEntry.Entries = this.denomEntry.Entries.filter(
          (e: any) => e.Count > 0 && e.Amount > 0
        );
        this.denomEntry.OpeningBalance = parentEntry['OpeningBalance'];
        this.denomEntry.CashIn = parentEntry['CashIn'];
        this.denomEntry.SalesCash = parentEntry['SalesCash'];
        this.denomEntry.CashOut = parentEntry['CashOut'];

        this.denomEntry.ExpectedBalance =
          this.denomEntry.OpeningBalance +
          this.denomEntry.CashIn +
          this.denomEntry.SalesCash -
          this.denomEntry.CashOut;
        console.log(this.denomEntry.ExpectedBalance);
        this.denomEntry.CashInJson = parentEntry['CashInJson'];
        this.denomEntry.CashOutJson = parentEntry['CashOutJson'];

        this.auth.addDenomEntry(this.denomEntry).subscribe((data: any) => {
          this.visible = false;
          this.fetchdenomentries();
        });
      }
    }
  }

  openDrawer() {
    this.visible = true;
    this.denomEntry = new DenomEntry(this.loginfo, null);
    this.denominations.forEach((den) => {
      this.denomEntry.Entries.push(new Entry(den));
    });
    this.entrydatetime = {
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HH:MM'),
    };
    console.log(this.denominations, this.denomEntry);
  }

  delete_denom_id: number = 0;
  showloading: boolean = false;
  deleteDenomEntry() {
    // this.showloading = true;
    console.log(this.delete_denom_id);
    if (this.delete_denom_id > 0) {
      this.auth
        .deleteDenomEntry(this.delete_denom_id)
        .subscribe((data: any) => {
          console.log(data);
          this.showloading = false;
          this.modalService.dismissAll();
          this.fetchdenomentries();
        });
    }
  }

  exceldata: any[] = [];
  exportToExcel() {
    let stores = this.denomentries.map((x) => {
      return { StoreId: x.StoreId, storename: x.storename };
    });
    stores = stores.filter(
      (x, i) => stores.findIndex((s) => s.StoreId == x.StoreId) == i
    );
    console.log(this.denomentries);
    stores.forEach((store) => {
      let charcode = 65;
      let obj: any = { store: store.storename };
      let detaiils: any = { store: '' };
      this.denomentries
        .filter((x) => x.StoreId == store.StoreId)
        .reverse()
        .forEach((entry, i) => {
          obj[String.fromCharCode(charcode + i)] = moment(
            entry.EntryDateTime
          ).format('hh:mm A');
          detaiils[String.fromCharCode(charcode + i)] = entry.diff;
        });
      this.exceldata.push(obj);
      this.exceldata.push(detaiils);
      this.exceldata.push({ store: '' });
    });
    console.log(this.exceldata);
    this.excelservice.exportAsExcelFile(this.exceldata, 'newexcel');
  }
}
// var grouped = _.mapValues(_.groupBy(this.cars, 'make'),
// clist => clist.map(car => _.omit(car, 'make')));
