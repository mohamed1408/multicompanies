import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { dangertoast } from 'src/assets/dist/js/toast-data';
import { HashLocationStrategy } from '@angular/common';
import { AuthService } from 'src/app/auth.service';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-cancel-ord-report',
  templateUrl: './cancel-ord-report.component.html',
  styleUrls: ['./cancel-ord-report.component.css'],
})
export class CancelOrdReportComponent implements OnInit {
  @ViewChild('itemsModal', { static: false }) private itemsModal:
    | ElementRef
    | any;

  orderwiserpt: any;
  show: boolean = true;
  CompanyId: number = 0;
  StoreId: number;
  startdate: any;
  enddate: any;
  stores: any;
  key = 'Name';
  storeId: any = 0;
  myControl = new FormControl();
  all: string = 'All';
  selected: { startDate: moment.Moment; endDate: moment.Moment } = {
    startDate: moment(),
    endDate: moment(),
  };
  alwaysShowCalendars: boolean;
  TotalSales = 0;
  TotalPayments = 0;
  term: string = '';
  p: any;
  showloading = true;
  ranges: any = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [
      moment().subtract(1, 'month').startOf('month'),
      moment().subtract(1, 'month').endOf('month'),
    ],
  };
  invalidDates: moment.Moment[] = [
    moment().add(2, 'days'),
    moment().add(3, 'days'),
    moment().add(5, 'days'),
  ];

  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some((d) => d.isSame(m, 'day'));
  };
  errorMsg: string = '';
  status!: number;
  cgst: any;
  sgst: any;
  receipt: any[] = [];
  subtotal: any;
  total: any;
  charge: any;
  ordcharges: any;
  discount!: number;
  sourceId = 0;
  sortfield: any;
  x!: number;
  y!: number;
  pricetot = 0;
  limited_user: boolean = true;
  constructor(private Auth: AuthService, private modalService: NgbModal) {
    this.alwaysShowCalendars = true;
    this.Auth.limited_user.subscribe((lu) => {
      this.limited_user = lu;
    });
    // var userinfo = localStorage.getItem("userinfo");
    // var userinfoObj = JSON.parse(userinfo);
    // this.CompanyId = userinfoObj[0].CompanyId;
    // var logInfo = JSON.parse(localStorage.getItem('loginInfo'));
    // this.CompanyId = logInfo.CompanyId;
    this.StoreId = 0;
  }

  ngOnInit() {
    this.selecteds(0);
    this.Auth.companyid.subscribe((companyid) => {
      this.CompanyId = companyid;
      this.Auth.isloading.next(true);
      this.GetStore();
    });
    setHeightWidth();
    // this.GetStore();
    var date = new Date();
    // this.startdate = {"year":date.getFullYear(),"month":date.getMonth()+1,"day":date.getDate()};
    // this.enddate = {"year":date.getFullYear(),"month":date.getMonth()+1,"day":date.getDate()};
    const frmdate = new Date(new Date().setDate(new Date().getDate() - 7));
    const todate = new Date();
    // this.startdate = moment().format('YYYY-MM-DD');
    // this.enddate = moment().format('YYYY-MM-DD');
    this.startdate = moment(todate).format('YYYY-MM-DD') || null;
    this.enddate = moment(todate).format('YYYY-MM-DD') || null;

    this.selected = {
      startDate: moment(this.startdate),
      endDate: moment(this.enddate),
    };
  }
  // Submit() {
  //   // this.loaderService.show();

  //   this.show = true;
  //   if (this.startdate.hasOwnProperty('month')) {
  //     this.startdate.month = this.startdate.month - 1;
  //     this.enddate.month = this.enddate.month - 1;
  //   }
  //   var frmdate = moment(this.startdate).format('YYYY-MM-DD');
  //   var todate = moment(this.enddate).format('YYYY-MM-DD');

  //   this.Auth.GetSalesRpt1(
  //     this.storeId,
  //     frmdate,
  //     todate,
  //     this.CompanyId,
  //     this.sourceId,
  //     1
  //   ).subscribe((data: any) => {
  //     this.orderwiserpt = data;
  //     console.log(this.orderwiserpt);
  //     this.TotalPayments = 0;
  //     this.TotalSales = 0;
  //     for (let i = 0; i < this.orderwiserpt.Order.length; i++) {
  //       console.log(this.orderwiserpt.Order[i].ItemJson);
  //       this.orderwiserpt.Order[i].OrderedDate = moment(
  //         this.orderwiserpt.Order[i].OrderedDate
  //       ).format('LLL');
  //       this.TotalPayments =
  //         this.TotalPayments + this.orderwiserpt.Order[i].PaidAmount;
  //       this.TotalSales =
  //         this.TotalSales + this.orderwiserpt.Order[i].BillAmount;
  //     }
  //     this.TotalSales = +this.TotalSales.toFixed(2);
  //     this.TotalPayments = +this.TotalPayments.toFixed(2);
  //     var response: any = data;
  //     if (response.status == 0) {
  //       this.status = 0;
  //       this.errorMsg = response.msg;
  //       console.log(dangertoast(this.errorMsg));
  //     }
  //     // this.loaderService.hide();
  //   });
  // }
  selectEvent(e: { Id: any }) {
    this.storeId = e.Id;
  }
  // itemdetails(itemjson: string, ChargeJson: string, sourceId: number) {
  //   this.receipt = [];
  //   this.sgst = 0;
  //   this.cgst = 0;
  //   this.subtotal = 0;
  //   if (itemjson) {
  //     if (sourceId != 1) {
  //       this.onlineOrderDetails(itemjson, ChargeJson, sourceId);
  //       return;
  //     }
  //     var itemarray = JSON.parse(itemjson);
  //     console.log(itemarray);
  //     itemarray.forEach((item: { Tax1: any; Tax2: any; TotalAmount: any }) => {
  //       // item.OptionGroup.forEach(optgrp => {
  //       //   optgrp.Option.forEach(opt => {
  //       //     item.Price = item.Price + opt.Price
  //       //     item.Product = item.Product + '/' + opt.Name
  //       //   });
  //       // });
  //       // item.Price = item.Price * item.Quantity - item.DiscAmount
  //       this.receipt.push(item);
  //       this.cgst = this.cgst + item.Tax1;
  //       this.sgst = this.sgst + item.Tax2;
  //       // console.log(this.subtotal)
  //       this.subtotal = this.subtotal + item.TotalAmount;
  //       // });
  //     });
  //     this.total = this.subtotal + this.sgst + this.cgst;
  //     console.log(chargejson);
  //     var chargejson = JSON.parse(ChargeJson);
  //     if (chargejson)
  //       chargejson.forEach((charge: { ChargeValue: any }) => {
  //         this.total = this.total + charge.ChargeValue;
  //       });
  //   }

  //   // this.openDetailpopup(modal);
  //   this.modalService.open(this.itemsModal, {
  //     centered: true,
  //     size: 'lg',
  //     backdropClass: 'z-index-1',
  //   });
  // }
  // onlineOrderDetails(
  //   // modal: any,
  //   itemjson: string,
  //   ChargeJson: string,
  //   sourceId: any
  // ) {
  //   var itemarray = JSON.parse(itemjson);
  //   console.log(itemarray);
  //   itemarray.forEach(
  //     (item: {
  //       Price: number;
  //       total: number;
  //       discount: number;
  //       Product: string;
  //       title: any;
  //       Quantity: any;
  //       quantity: any;
  //       options_to_add: any[];
  //       Tax1: any;
  //       taxes: { value: any }[];
  //       Tax2: any;
  //     }) => {
  //       item.Price = item.total - item.discount;
  //       item.Product = item.title;
  //       item.Quantity = item.quantity;
  //       item.options_to_add.forEach((opt: { title: string }) => {
  //         item.Product = item.Product + '/' + opt.title;
  //         // optgrp.Option.forEach(opt => {
  //         //   item.Price = item.Price + opt.Price
  //         //   item.Product = item.Product + '/' + opt.Name
  //         // });
  //       });
  //       // item.Price = item.Price - item.DiscAmount
  //       this.receipt.push(item);
  //       item.Tax1 = item.taxes[0] ? item.taxes[0].value : 0;
  //       item.Tax2 = item.taxes[1] ? item.taxes[1].value : 0;
  //       this.cgst = this.cgst + item.Tax1;
  //       this.sgst = this.sgst + item.Tax2;
  //       // console.log(this.subtotal)
  //       this.subtotal = this.subtotal + item.Price;
  //       // });
  //     }
  //   );
  //   this.total = this.subtotal + this.sgst + this.cgst;
  //   console.log(chargejson);
  //   if (ChargeJson) {
  //     var chargejson = JSON.parse(ChargeJson);
  //     chargejson.forEach((charge: { ChargeValue: any }) => {
  //       this.total = this.total + charge.ChargeValue;
  //     });
  //   }

  //   // this.openDetailpopup(modal);
  //   this.modalService.open(this.itemsModal, {
  //     centered: true,
  //     size: 'lg',
  //     backdropClass: 'z-index-1',
  //   });
  // }
  // filter1(Id: any) {
  //   var orderitem = this.orderwiserpt.order1.filter(
  //     (x: { OrderId: any }) => x.OrderId == Id
  //   );
  //   console.log(orderitem);
  //   this.receipt = [];
  //   this.sgst = 0;
  //   this.cgst = 0;
  //   this.subtotal = 0;
  //   this.pricetot = 0;
  //   this.discount = this.orderwiserpt.Order.filter(
  //     (x: { Id: any }) => x.Id == Id
  //   )[0].DiscAmount;
  //   orderitem.forEach(
  //     (element: {
  //       Price: number;
  //       Quantity: number;
  //       Tax1: number;
  //       Tax2: number;
  //     }) => {
  //       this.pricetot = element.Price * element.Quantity;
  //       this.cgst = this.cgst + (element.Tax1 * this.pricetot) / 100;
  //       this.sgst = this.sgst + (element.Tax2 * this.pricetot) / 100;
  //       this.subtotal = this.pricetot + this.subtotal;
  //       this.receipt.push(element);
  //       this.total = this.subtotal + this.sgst + this.cgst;
  //       console.log(this.receipt);
  //       var orderitem1 = this.orderwiserpt.order3.filter(
  //         (x: { OrderId: any }) => x.OrderId == Id
  //       );
  //       this.ordcharges = orderitem1;
  //       console.log(orderitem1);
  //       this.ordcharges.forEach((element: { ChargeAmount: any }) => {
  //         this.total = this.total + element.ChargeAmount;
  //       });
  //       this.total = (this.total - this.discount).toFixed(0);
  //     }
  //   );
  // }

  CancelRptIndex: any;
  All() {
    // this.loaderService.show();

    var frmdate = moment().format('YYYY-MM-DD  00:00:00');
    var todate = moment().format('YYYY-MM-DD  23:59:59');
    this.Auth.CancelledRpt(
      this.startdate,
      this.enddate,
      this.storeId,
      this.CompanyId,
      this.sourceId
    ).subscribe((data: any) => {
      this.CancelRptIndex = data['Index'];
      console.log(this.CancelRptIndex);
      this.showloading = false;
    });
  }
  // strMatch(string: string | any, substring: any) {
  //   return string.toLowerCase().includes(substring);
  // }
  // filter(order: { [x: string]: { toString: () => any } }) {
  //   const term = this.term.toLowerCase();
  //   if (term == '') return true;
  //   var ismatching = false;
  //   Object.keys(order).forEach((key) => {
  //     if (typeof order[key] == 'string')
  //       this.strMatch(order[key], term) ? (ismatching = true) : null;
  //     if (typeof order[key] == 'number')
  //       this.strMatch(order[key].toString(), term) ? (ismatching = true) : null;
  //   });
  //   return ismatching;
  // }
  // calculate() {
  //   this.TotalSales = 0;
  //   this.TotalPayments = 0;
  //   this.orderwiserpt.Order.filter((x: any) => this.filter(x)).forEach(
  //     (order: { BillAmount: number; PaidAmount: number }) => {
  //       this.TotalSales += order.BillAmount;
  //       this.TotalPayments += order.PaidAmount;
  //     }
  //   );
  //   // console.log(this.term, this.orderwiserpt.Order.filter(x => this.filter(x)).length)
  // }
  GetStore() {
    this.Auth.GetStores(this.CompanyId).subscribe((data: any) => {
      this.stores = data;
      console.log(this.stores);
      var obj = {
        Id: 0,
        Name: 'All',
        ParentStoreId: null,
        ParentStore: null,
        IsMainStore: false,
      };
      this.stores.push(obj);
      var response: any = data;
      this.All();

      if (response.status == 0) {
        this.status = 0;
        this.errorMsg = response.msg;
        console.log(dangertoast(this.errorMsg));
      }
      this.Auth.isloading.next(false);
    });
  }

  // sortsettings(field: any) {
  //   if (this.sortfield == field) {
  //     this.x = this.x * -1;
  //     this.y = this.y * -1;
  //   } else {
  //     this.sortfield = field;
  //     this.x = -1;
  //     this.y = 1;
  //   }
  // }

  // get sortData() {
  //   if (this.orderwiserpt) {
  //     return this.orderwiserpt.Order.sort(
  //       (a: { [x: string]: number }, b: { [x: string]: number }) => {
  //         if (a[this.sortfield] < b[this.sortfield]) return this.x;
  //         else if (a[this.sortfield] > b[this.sortfield]) return this.y;
  //         else return 0;
  //       }
  //     );
  //   } else {
  //     return [];
  //   }
  // }

  date(
    e:
      | {
          startDate: { format: (arg0: string) => any };
          endDate: { format: (arg0: string) => any };
        }
      | any
  ) {
    // console.log(e);
    if (e && e.startDate && e.endDate) {
      this.startdate = e.startDate.format('YYYY-MM-DD');
      this.enddate = e.endDate.format('YYYY-MM-DD');
    }
  }

  // openDetailpopup(contentdetail: any) {
  //   const modalRef = this.modalService
  //     .open(contentdetail, {
  //       ariaLabelledBy: 'modal-basic-title',
  //       centered: true,
  //     })
  //     .result.then(
  //       (result) => {},
  //       (reason) => {}
  //     );
  // }
  focusAutocomplete() {
    var xPathResult = document.evaluate(
      '//*[@id="maindiv"]/app-root/app-order-wise-sales-rpt/div/div/div[2]/div/section/div[1]/div[1]/ng-autocomplete/div/div[1]/input',
      document,
      null,
      undefined,
      null
    );
    var element: any = null;
    if (xPathResult) {
      element = xPathResult.iterateNext();
    }
    element?.focus();
  }

  hidecontent: boolean = true;
  keycode: string = 'sorrymaintenanceare';
  keyarr: Array<string> = [];
  unlockpagr(key: string) {
    this.keyarr = [...this.keyarr, key];
    if (this.keyarr.length == 3) {
      this.hidecontent = !(this.keyarr.join('') == this.keycode);
    }
  }

  Submit() {
    this.Auth.CancelledRpt(
      this.startdate,
      this.enddate,
      this.storeId,
      this.CompanyId,
      this.sourceId
    ).subscribe((data: any) => {
      console.log(data);
      this.CancelRptIndex = data['Index'];
    });
  }

  selecteds(e: any) {
    this.storeId = e.Id;
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

  searchTerm: string = '';
}
