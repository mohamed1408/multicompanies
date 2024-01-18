import * as moment from 'moment';
import { AuthService } from '../auth.service';
import { Ng2SearchPipe } from 'ng2-search-filter';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { dtrangepicker } from '../../assets/dist/js/datePickerHelper';
import { Transaction } from '../model/model';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css'],
  providers: [Ng2SearchPipe],
})
export class TransactionListComponent implements OnInit {
  @ViewChild('selection', { static: false }) private selection: ElementRef | any;
  @ViewChild('transactioneditmdl', { static: false }) private transactioneditmdl: ElementRef | any;
  @ViewChild('compare_modal', { static: true }) private compare_modal!: ElementRef;

  searchTerm: string = ""
  stores: any[] = []
  storeid: number = 0
  companyid: number = 0;
  fromdate: string = ""
  todate: string = ""
  ptypes: any[] = []
  splitpayment: {
    isvalid: boolean;
    remarks: string;
    transactions: Transaction[];
    addtrnsxn: () => void;
    delete: (i: number) => void;
    validate: () => void;
  } = {
      isvalid: true, remarks: "", transactions: [], addtrnsxn: () => {
        if (this.selectedtransaxn && this.splitpayment.transactions.length < this.ptypes.length - 1) {
          let tr = new Transaction(this.companyid, this.storeid, this.selectedtransaxn.OrderId)
          tr.Amount = this.selectedtransaxn.ogAmount - this.selectedtransaxn.Amount - this.splitpayment.transactions.map((x: any) => x.Amount).reduce((a: any, c: any) => a + c, 0)
          tr.StorePaymentTypeId = this.ptypes.filter(x => ![this.selectedtransaxn.StorePaymentTypeId, ...this.splitpayment.transactions.map(y => y.StorePaymentTypeId)].includes(x.Id))[0].Id
          tr.StorePaymentTypeName = this.ptypes.filter(x => x.Id == tr.StorePaymentTypeId)[0].Name
          tr.InvoiceNo = this.selectedtransaxn.ino
          tr.TransDate = moment(this.selectedtransaxn.TransDate).format("YYYY-MM-DD")
          tr.TransDateTime = this.selectedtransaxn.TransDateTime
          this.splitpayment.transactions.push(tr)
        }
      },
      delete: (i: number) => {
        this.splitpayment.transactions.splice(i, 1)
      },
      validate: () => {
        this.splitpayment.isvalid = true
        let total = this.selectedtransaxn.Amount + this.splitpayment.transactions.map(x => x.Amount).reduce((a, c) => a + c, 0)
        if (this.splitpayment.transactions.filter(x => x.Amount > 0).length > 0 && total > this.selectedtransaxn.ogAmount) {
          this.splitpayment.isvalid = false
          this.splitpayment.remarks = `total amount - ${total} - exceeds original amount ${this.selectedtransaxn.ogAmount} by ${total - this.selectedtransaxn.ogAmount}`
        }
        this.splitpayment.transactions.forEach(t => {
          t.TransDateTime = moment(t.TransDate).format("YYYY-MM-DD") + moment(t.TransDateTime).format(" hh:mm:ss")
        })
      }
    }
  pos_report: { summary: any[], transactions: any[], showtransaxns: any[], total: { bills: number, amount: number } } = { summary: [], transactions: [], showtransaxns: [], total: { bills: 0, amount: 0 } }

  constructor(private auth: AuthService, private modalService: NgbModal) { }

  ngOnInit(): void {
    setHeightWidth();
  }

  initial() {
    this.auth.companyid.subscribe((companyid) => {
      this.companyid = companyid;
      this.auth.isloading.next(true);
      this.getStores();
      this.auth.companies;
    });
    this.auth.companies.subscribe((comps) => {
      if (comps.findIndex((x) => x.CompanyId == 0) == -1)
        this.auth.companies.next([
          {
            AccountId: 0,
            AccountName: 'All',
            Address: '',
            CompanyId: 0,
            CompanyName: '',
            Email: '',
            UserId: 0,
          },
          ...comps,
        ]);
    });
    this.setDateRange();
  }
  getStores() {
    this.auth.GetStores(this.companyid).subscribe((data: any) => {
      this.storeid = 0
      this.stores = [{ Id: 0, Name: 'All' }, ...data];
      this.auth.isloading.next(false);
    });
  }
  getspt() {
    this.auth.getspt(this.storeid).subscribe((data: any) => {
      this.ptypes = data["paymenttypes"]
    })
  }
  getTransactionList() {
    if (this.storeid == 0) {
      return
    }
    this.auth.getstorepaymentsbytype(this.storeid, this.companyid, this.fromdate, this.todate).subscribe((data: any) => {
      this.selectedtransaxn = new Transaction(this.companyid, this.storeid, 0);
      this.pos_report = { summary: data["pos_summary"], total: { bills: data["pos_summary"].map((x: any) => x.BillCount).reduce((a: number, c: number) => a + c, 0), amount: data["pos_summary"].map((x: any) => x.Amount).reduce((a: number, c: number) => a + c, 0) }, transactions: data["pos_transactions"], showtransaxns: data["pos_transactions"].filter((x: any) => x.StorePaymentTypeId == data["pos_summary"][0].StorePaymentTypeId) }
    })
  }
  setDateRange() {
    dtrangepicker('myrangepicker', (start: any, end: any) => {
      this.fromdate = start.startOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.todate = end.endOf('day').format('YYYY-MM-DD HH:mm:ss');
      (document.getElementById("typeahead-template") as HTMLElement).focus()
      console.log(this.fromdate, this.todate);
    })(moment(), moment());
  }

  formatter = (result: any) => result.Name;

  search: OperatorFunction<string, readonly string[]> = (
    text$: Observable<string>
  ) =>
    text$.pipe(
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : this.stores
            .filter(
              (v: any) =>
                v.Name.toLowerCase().indexOf(term.toLowerCase()) > -1
            )
            .slice(0, 10)
      )
    );

  selected(e: any) {
    this.storeid = e.Id;
    this.getspt()
  }

  selectptype(i: number) {
    let selection = document.getElementById("selection") as HTMLElement
    console.log(selection)
    selection.style.transform = `translate3d(0px, ${48 * i}px, 0px)`
    this.pos_report.showtransaxns = this.pos_report.transactions.filter((x: any) => x.StorePaymentTypeId == this.pos_report.summary[i].StorePaymentTypeId)
  }
  selectedtransaxn: any
  date: string = ''
  time: string = ''
  editTransaction(i: number, event: MouseEvent) {
    this.selectedtransaxn = this.copyworef(this.pos_report.showtransaxns[i])
    this.selectedtransaxn.StorePaymentTypeId = +this.selectedtransaxn.StorePaymentTypeId
    this.selectedtransaxn.ogAmount = +this.selectedtransaxn.Amount
    this.date = moment(this.selectedtransaxn.TransDate).format("YYYY-MM-DD")
    console.log(this.selectedtransaxn)
    this.modalService.open(this.transactioneditmdl, {
      centered: true,
      size: 'lg',
      windowClass: 'float-right',
      backdropClass: 'z-index-1',
    })
    // let popup = document.getElementById("ptype-pop") as HTMLElement
    // let srcEl = event.target as HTMLElement
    // popup.style.top = (event.pageY - (popup.clientHeight / 2)) + 'px'
    // popup.style.left = (20 + event.pageX + (srcEl.clientWidth - event.offsetX)) + 'px'
  }
  updatetransaction() {
    if (this.selectedtransaxn.Amount <= 0) {
      return
    }
    this.splitpayment.validate()
    if (!this.splitpayment.isvalid) {
      return
    }
    this.selectedtransaxn.TransDate = moment(this.date).format("YYYY-MM-DD")
    this.selectedtransaxn.TransDateTime = moment(this.date).format("YYYY-MM-DD") + moment(this.selectedtransaxn.TransDateTime).format(" hh:mm:ss")
    this.splitpayment.transactions = this.splitpayment.transactions.filter(x => x.Amount > 0)
    // console.log(this.selectedtransaxn)
    // return
    this.auth.savetransaction(this.selectedtransaxn).subscribe(data => {
      if (this.splitpayment.transactions.length > 0) {
        this.auth.ordertransaction(this.splitpayment.transactions).subscribe(data => {
          this.getTransactionList();
          this.modalService.dismissAll()
        })
      } else {
        this.getTransactionList();
        this.modalService.dismissAll()
      }
    })
  }
  transaxnlsttxt: string = ""
  compare() {
    this.transaxnlsttxt = ""
    this.modalService.open(this.compare_modal, {
      centered: true,
      size: 'lg',
      backdropClass: 'z-index-1',
    })
  }
  scan() {
    console.log(this.transaxnlsttxt)
    let splitData = this.transaxnlsttxt.split("\n").map(x => x.split("\t").filter(x => x != ""))
    console.log(splitData)
    let headers = splitData[0]
    let arr: any[] = []
    splitData.slice(1).forEach(line => {
      let obj: any = {}
      headers.forEach((hdr, i) => {
        obj[hdr] = line[i]
      })
      obj["Net Amount"] = +obj["Net Amount"]
      arr.push(obj)
    })
    console.log(arr)
  }
  hidecontent: boolean = true;
  keycode: string = 'sorrymaintenanceare';
  keyarr: Array<string> = [];
  unlockpagr(key: string) {
    this.keyarr = [...this.keyarr, key];
    if (this.keyarr.length == 3) {
      this.hidecontent = !(this.keyarr.join('') == this.keycode);
      if (!this.hidecontent) {
        this.initial()
      }
      this.keyarr = []
    }
  }
  copyworef(obj: any) {
    return JSON.parse(JSON.stringify(obj))
  }
}
