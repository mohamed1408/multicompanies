import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Ng2SearchPipe } from 'ng2-search-filter';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import * as moment from 'moment';
import { dtrangepicker } from '../../../assets/dist/js/datePickerHelper';
import { ColorService } from 'src/app/services/color/color.service';

declare function setHeightWidth(): any;
declare var $: any;
declare var feather: any;
@Component({
  selector: 'app-deliveryorderreport',
  templateUrl: './deliveryorderreport.component.html',
  styleUrls: ['./deliveryorderreport.component.css'],
  providers: [Ng2SearchPipe],
})
export class DeliveryorderreportComponent implements OnInit {
  storeid: number = 0;
  sourceid: number = 0;
  companyid: number = 0;

  totalba: number = 0;
  totalpa: number = 0;

  term: string = '';
  todate: string = '';
  fromdate: string = '';
  searchTerm: string = '';
  cancelreason: string = '';

  showmenu: boolean = false;
  cancelling: boolean = false;

  report: any[] = [];
  stores: any[] = [];
  storeOrderCount: any = [];
  ordertypes: { id: number; title: string }[] | any = [];
  sortSetting: any = {
    key: 'oddt',
    ss: 0,
    sort: () => {
      console.log('sorting...');
      this.sortSetting.ss = this.sortSetting.ss > -1 ? -1 : 1;
      this.report = this.report.sort(
        (a, b) => (a.oddt.unix() - b.oddt.unix()) * this.sortSetting.ss
      );
    },
  };

  products: oprep;

  constructor(
    private auth: AuthService,
    private ng2filterpipe: Ng2SearchPipe,
    public cservice: ColorService
  ) {
    this.products = new oprep([]);
    this.ordertypes = [
      { id: 0, title: 'All', count: 0 },
      { id: 1, title: 'Dine In', count: 0 },
      { id: 2, title: 'Take Away', count: 0 },
      { id: 3, title: 'Delivery', count: 0 },
      { id: 4, title: 'Pick Up', count: 0 },
      { id: 5, title: 'Quick', count: 0 },
    ];
    this.ordertypes['selected'] = 0;
  }

  ngOnInit(): void {
    setHeightWidth();
    this.initial();
  }
  initial() {
    this.getProducts();
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
      this.storeid = 0;
      this.storeOrderCount = data.map((x: any) => {
        x.delivery = 0;
        x.takeaway = 0;
        x.pickup = 0;
        x.oc = (oti: number) => {
          if (oti == 2) {
            x.takeaway++;
          } else if (oti == 3) {
            x.delivery++;
          } else if (oti == 4) {
            x.pickup++;
          }
        };
        return x;
      });
      this.stores = [{ Id: 0, Name: 'All' }, ...data];
      this.auth.isloading.next(false);
    });
  }
  getProducts() {
    this.auth.getAllOld().subscribe((data: any) => {
      this.products = new oprep(data);
    });
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

  startdate: moment.Moment = moment().startOf('day').subtract(16, 'hour');
  enddate: moment.Moment = moment().endOf('day');

  date(e: any) {
    if (e.startDate && e.endDate) {
      this.startdate = e.startDate.format('YYYY-MM-DD');
      this.enddate = e.endDate.format('YYYY-MM-DD');
    }
  }

  setDateRange() {
    setTimeout(() => {
      $('input[name="datetimes"]').daterangepicker(
        {
          timePicker: true,
          startDate: this.startdate,
          endDate: this.enddate,
          cancelClass: 'btn-secondary',
          locale: {
            format: 'DD/M hh:mm A',
          },
        },
        (a: moment.Moment, b: moment.Moment) => {
          this.startdate = a;
          this.enddate = b;
          console.log(
            a.format('YYYY-MM-DD HH:mm A'),
            b.format('YYYY-MM-DD HH:mm A')
          );
        }
      );
    }, 500);
  }

  selected(e: any) {
    this.storeid = e.Id;
  }

  itemagg(items: any[]) {
    // console.log(items)
    let ci: any[] = [];
    items.forEach((it) => {
      let pk = it.r ? it.r.split(':').pop() : it.ProductKey;
      if (ci.some((x) => x.pk == pk)) {
        ci.filter((x) => x.pk == pk)[0].qa(it.qy);
      } else {
        let c: any = {
          pd: this.products.f(it.pi || it.ProductId)?.Name,
          t: (it.t1 || it.Tax1) + (it.t2 || it.Tax2),
          pr: it.p || it.Price,
          qy: it.qt || it.Quantity,
          ta: 0,
        };
        c.cta = () => {
          c.ta = c.qy * c.pr;
        };
        c.qa = (q: number) => {
          c.qy += q;
          c.cta();
        };
        c.cta();
        ci.push(c);
      }
    });
    return ci;
  }
  Report: any[] = [];
  transaxns: any[] = [];

  Ordernew: any;
  getorderreport() {
    this.ordertypes = [
      { id: 0, title: 'All', count: 0 },
      { id: 1, title: 'Dine In', count: 0 },
      { id: 2, title: 'Take Away', count: 0 },
      { id: 3, title: 'Delivery', count: 0 },
      { id: 4, title: 'Pick Up', count: 0 },
      { id: 5, title: 'Quick', count: 0 },
    ];
    this.ordertypes['selected'] = 0;
    this.auth
      .orderwiseV2_temp(
        this.startdate.format('YYYY-MM-DD HH:mm A'),
        this.enddate.format('YYYY-MM-DD HH:mm A'),
        this.storeid,
        this.companyid
      )
      .subscribe((data: any) => {
        this.Ordernew = data['report'];
        let report: any[] = data['report'];
        console.log('HYPERTECH1', report);
        this.transaxns = data['transaxns'];
        this.transaxns.forEach((txn) => {
          txn.InvoiceNo = this.Ordernew.filter(
            (x: any) => x.OdrsId == txn.OrderId
          )[0].ino;
          txn.OrderTypeId = this.Ordernew.filter(
            (x: any) => x.OdrsId == txn.OrderId
          )[0].oti;
        });
        console.log(this.transaxns);
        this.totalba = 0;
        this.totalpa = 0;
        this.report = [];
        report
          .filter((x) => x.json)
          .forEach((r) => {
            if (this.report.some((x) => x.OdrsId == r.OdrsId)) {
              this.report.filter((x) => x.OdrsId == r.OdrsId)[0].addkot(r.json);
            } else {
              r.kots = [];
              r.oddt = moment(r.oddt);
              r.addkot = (json: string) => {
                r.kots.push(JSON.parse(json));
                r.items = this.itemagg(
                  r.kots.map((x: any) => x.its || x.Items).flat()
                );
              };
              r.addkot(r.json);
              r.itemlist = r.items
                .map((x: any) => x.pd + ` [${x.qy}]`)
                .join(', ');
              r.transaxnlist = data['transaxns']
                .filter((x: any) => x.OdrsId == r.OdrsId)
                .map((x: any) => x.spt + ': ' + x.Amount)
                .join('|');
              delete r.json;
              this.report.push(r);
              console.log(r.transaxnlist);
              console.log(this.report);
              this.totalba += r.ba;
              this.totalpa += r.pa;
              this.ordertypes.filter((x: any) => x.id == r.oti)[0].count++;
              this.ordertypes[0].count++;
              this.storeOrderCount
                .filter((x: any) => x.Id == r.si)[0]
                .oc(r.oti);
            }
          });
        console.log(data['ZSorder']);
        data['ZSorder'].forEach((item: any) => {
          item.items = JSON.parse(item.items);
        });
        this.report.push(...data['ZSorder']);
        console.log(data['ZSorderTrans']);

        this.report.sort((a: ReportItem, b: ReportItem) => {
          const dateA = new Date(a.didt);
          const dateB = new Date(b.didt);
          return dateB.getTime() - dateA.getTime();
        });
        console.log(this.report);
        this.Report = this.report;
      });
  }
  filter() {
    this.totalba = 0;
    this.totalpa = 0;
    this.ng2filterpipe.transform(this.Report, this.term).forEach((x: any) => {
      this.totalba += x.ba;
      this.totalpa += x.pa;
    });
  }
  gds: GDS = new GDS();
  groupdatabystore() {
    this.gds = new GDS(this.term);
    console.log(this.gds);
    this.report.forEach((r) => {
      console.log(this.gds);
      if (r.itemlist.toLowerCase().includes(this.term.toLowerCase())) {
        this.gds.add(r);
      }
    });
  }
  selectedOrder: any;
  oti: number = 0;
  temporder: any;
  selectOrder(order: any) {
    console.log(order);
    this.temporder = order;
    console.log(this.temporder);
    this.temporder.StatusName = order.StatusName;
    this.temporder.OrderStatusId = order.osi;
    this.temporder.StoreName = order.Store;
    this.temporder.InvoiceNo = order.ino;
    this.temporder.Note = order.n;
    this.temporder.BillAmount = order.ba;
    this.temporder.PaidAmount = order.pa;
    this.temporder.OrderedDate = moment(order.od).format('YYYY-MM-DD');
    this.temporder.DeliveryDateTime = moment(order.didt).format('YYYY-MM-DD');
    this.temporder.DeliveredDateTime = moment(order.dddt).format('YYYY-MM-DD');
    this.temporder.DeliveryStoreName = order.DeliveryStoreName;
  }
  clearselection() {
    this.report.forEach((x) => (x.selected = false));
  }
  getstorereport(store: any) {
    this.searchTerm = store;
    this.storeid = store.Id;
    this.getorderreport();
  }
  toClipBoard() {
    // Clipboard
    let cbt: string = 'STORE \t TAK \t DEL \t PICK \n';
    this.storeOrderCount.forEach((r: any) => {
      console.log(this.storeOrderCount);
      cbt += `${r.Name} \t ${r.takeaway} \t ${r.delivery} \t ${r.pickup} \n`;
    });
    navigator.clipboard.writeText(cbt);
  }
  cancell() {
    if (!this.cancelling) {
      this.cancelling = true;
      return;
    }
    if (this.cancelreason == '') {
      $('#coem')[0].hidden = false;
      return;
    }
    this.auth
      .cancelorder(this.selectedOrder.OdrsId, this.cancelreason)
      .subscribe((res: any) => {
        if (res.status == 200) {
          this.report.filter(
            (x) => x.OdrsId == this.selectedOrder.OdrsId
          )[0].osi = -1;
        }
        this.cancelling = false;
      });
  }
  hidecontent: boolean = true;
  keycode: string = 'sorrymaintenanceare';
  keyarr: Array<string> = [];
  unlockpagr(key: string) {
    this.keyarr = [...this.keyarr, key];
    if (this.keyarr.length == 3) {
      this.hidecontent = !(this.keyarr.join('') == this.keycode);
      if (!this.hidecontent) {
        this.initial();
      }
      this.keyarr = [];
    }
  }

  txnToClipBoard() {
    let cbt: string = 'INVOICE \t AMOUNT \t\t DATE \n';
    this.Ordernew.forEach((o: any) => {
      let txn = this.transaxns.filter((x: any) => x.OrderId == o.OdrsId);
      if (txn.length > 0) {
        txn
          .sort((a: any, b: any) => b.OrderId - a.OrderId)
          .forEach((x: any, i: number) => {
            cbt += `${i == 0 ? o.ino : ''} \t ${
              x.Amount + ' \t ' + x.ptype
            } \t ${moment(x.TransDateTime).format('MMM D, hh:mm a')} \n`;
          });
      }
    });
    navigator.clipboard.writeText(cbt);
  }

  openModal() {
    // Show the modal when the button is clicked
    $('#myModal').modal('show');
  }

  closeModal() {
    // Close the modal when called
    $('#myModal').modal('hide');
  }
}
interface op {
  CategoryId: number;
  Id: number;
  Name: string;
  OldId: number;
  Price: number;
  TaxGroupId: number;
  groupid: number;
}
class oprep {
  products: op[];
  constructor(prods: any[]) {
    this.products = prods;
  }
  f(id: number) {
    return this.products.filter((x) => x.OldId == id)[0];
  }
}
class GDS {
  sterm: string;
  data: { storeid: number; Store: string; ordercount: number; qty: number }[];
  constructor(term: string = '') {
    this.sterm = term;
    this.data = [];
  }
  add(order: any) {
    console.log(order);
    if (!this.data.some((x) => x.storeid == order.si)) {
      this.data.push({
        storeid: order.si,
        Store: order.Store,
        ordercount: 0,
        qty: 0,
      });
    }
    this.data.filter((x) => x.storeid == order.si)[0].ordercount++;
    this.data.filter((x) => x.storeid == order.si)[0].qty += order.items
      .filter((x: any) => x.pd.toLowerCase().includes(this.sterm.toLowerCase()))
      .map((x: any) => x.qy)
      .reduce((a: number, c: number) => a + c, 0);
  }
}

interface ReportItem {
  didt: string;
}
