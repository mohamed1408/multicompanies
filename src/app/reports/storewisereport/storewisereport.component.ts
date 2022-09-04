import * as moment from 'moment';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth.service';

export interface PeriodicElement {
  Name: string;
  Quantity: number;
  FreeQty: number;
  Totalqty: number;
  TotalSales: number;
}

@Component({
  selector: 'app-storewisereport',
  templateUrl: './storewisereport.component.html',
  styleUrls: ['./storewisereport.component.css'],
})
export class StorewisereportComponent implements OnInit {
  orders: PeriodicElement[] = [];
  displayedColumns: string[] = [
    'Name',
    'Quantity',
    'FreeQty',
    'Totalqty',
    'TotalSales',
  ];

  CompanyId: number = 0;
  StoreId: number = 0;
  categoryId: any;
  catId: any = 0;
  productId: any;
  all: string = 'All';
  prd: string = 'All';
  category: any;
  product: any;
  alwaysShowCalendars: boolean;
  key = 'Description';
  key2 = 'Description';
  startdate: any;
  enddate: any;
  show: boolean = true;
  storewiserpt: any;
  prdstore: any;
  TotalSales = 0;
  sourceId = 0;
  Totalqty = 0;
  FreeQty = 0;
  Quantity = 0;
  TotalProductSale = 0;
  TotalPrdQty = 0;
  term: any;
  p: any;
  showloading = true;
  storewisedata = [];
  storeproducts: any;
  filteredproducts: any;
  filtprd: any;
  categorywiserpt: any;
  TotalPrdtSale = 0;
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
  selected: any = { startDate: moment(), endDate: moment() };
  invalidDates: moment.Moment[] = [
    moment().add(2, 'days'),
    moment().add(3, 'days'),
    moment().add(5, 'days'),
  ];
  tags: any;
  tagId = 0;
  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some((d) => d.isSame(m, 'day'));
  };
  sortfield: any;
  x: number = 0;
  y: number = 0;

  //unwanted
  ProdNStore: any;
  CatNStore: any;
  constructor(private Auth: AuthService, private modalService: NgbModal) {
    this.alwaysShowCalendars = true;
    // var logInfo = JSON.parse(localStorage.getItem("loginInfo"));
    // this.CompanyId = logInfo.CompanyId;
  }
  dtOptions: any = {};

  ngOnInit() {
    this.Auth.companyid.subscribe((companyid) => {
      this.CompanyId = companyid;
      // this.Auth.isloading.next(true);
      this.Getcategory();
      this.All();
      this.startdate = moment().format('YYYY-MM-DD');
      this.enddate = moment().format('YYYY-MM-DD');
      this.GetProduct();
      this.gettags();
    });

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 3,
      processing: true,
      dom: 'Bfrtip',
      buttons: ['copy', 'csv', 'excel', 'print', 'pdf'],
    };
    this.Getcategory();
    this.All();
    this.startdate = moment().format('YYYY-MM-DD');
    this.enddate = moment().format('YYYY-MM-DD');
    this.GetProduct();
    this.gettags();
  }

  Submit() {
    this.show = true;
    if (this.startdate.hasOwnProperty('month')) {
      this.startdate.month = this.startdate.month - 1;
      this.enddate.month = this.enddate.month - 1;
    }
    var frmdate = moment(this.startdate).format('YYYY-MM-DD');
    var todate = moment(this.enddate).format('YYYY-MM-DD');

    this.Auth.GetSalesRpt6(
      this.categoryId,
      frmdate,
      todate,
      this.CompanyId,
      this.sourceId,
      this.productId,
      this.tagId
    ).subscribe((data) => {
      this.storewiserpt = data;
      console.log(this.storewiserpt);
      this.TotalSales = 0;
      this.Quantity = 0;
      this.FreeQty = 0;
      this.Totalqty = 0;
      for (let i = 0; i < this.storewiserpt.Order.length; i++) {
        this.TotalSales =
          this.TotalSales + this.storewiserpt.Order[i].TotalSales;
        this.Quantity = this.Quantity + this.storewiserpt.Order[i].Quantity;
        this.FreeQty = this.FreeQty + this.storewiserpt.Order[i].FreeQty;
        this.Totalqty = this.Totalqty + this.storewiserpt.Order[i].Totalqty;
      }
      this.TotalSales = +this.TotalSales.toFixed(2);
      this.Quantity = +this.Quantity.toFixed(2);
      this.FreeQty = +this.FreeQty.toFixed(2);
      this.Totalqty = +this.Totalqty.toFixed(2);
    });
  }

  All() {
    var frmdate = moment(this.startdate).format('YYYY-MM-DD');
    var todate = moment(this.enddate).format('YYYY-MM-DD');
    this.Auth.GetSalesRpt6(
      this.categoryId,
      frmdate,
      todate,
      this.CompanyId,
      this.sourceId,
      this.productId,
      this.tagId
    ).subscribe((data) => {
      this.storewiserpt = data;
      console.log(this.storewiserpt);
      this.TotalSales = 0;
      this.Quantity = 0;
      this.FreeQty = 0;
      this.Totalqty = 0;
      for (let i = 0; i < this.storewiserpt.Order.length; i++) {
        this.TotalSales =
          this.TotalSales + this.storewiserpt.Order[i].TotalSales;
        this.Quantity = this.Quantity + this.storewiserpt.Order[i].Quantity;
        this.FreeQty = this.FreeQty + this.storewiserpt.Order[i].FreeQty;
        this.Totalqty = this.Totalqty + this.storewiserpt.Order[i].Totalqty;
      }
      this.TotalSales = +this.TotalSales.toFixed(2);
      this.Quantity = +this.Quantity.toFixed(2);
      this.FreeQty = +this.FreeQty.toFixed(2);
      this.Totalqty = +this.Totalqty.toFixed(2);
      this.showloading = false;
    });
  }

  sortsettings(field: any) {
    if (this.sortfield == field) {
      this.x = this.x * -1;
      this.y = this.y * -1;
    } else {
      this.sortfield = field;
      this.x = -1;
      this.y = 1;
    }
  }

  get sortData() {
    return this.storewiserpt.Order.sort((a: any, b: any) => {
      if (a[this.sortfield] < b[this.sortfield]) return this.x;
      else if (a[this.sortfield] > b[this.sortfield]) return this.y;
      else return 0;
    });
  }

  selectEvent(e: any) {
    this.categoryId = e.Id;
  }

  selectedEvent(e: any) {
    this.productId = e.Id;
  }

  date(e: any) {
    console.log(e);
    if (e.startDate != null && e.endDate != null) {
      this.startdate = e.startDate.format('YYYY-MM-DD');
      this.enddate = e.endDate.format('YYYY-MM-DD');
    }
  }

  Getcategory() {
    this.Auth.getcat(this.CompanyId).subscribe((data) => {
      this.category = data;
      var obj = { Id: 0, Description: 'All', ParentCategoryId: null };
      this.category.push(obj);
    });
  }

  GetProduct() {
    this.Auth.getcatprd(this.CompanyId).subscribe((data) => {
      this.product = data;
      var obj = { Id: 0, Description: 'All', ParentCategoryId: null };
      this.product.push(obj);
    });
  }
  gettags() {
    this.Auth.getTag(this.CompanyId).subscribe((data) => {
      this.tags = data;
    });
  }
  setTagId(event: Event) {
    this.tagId = +(event.target as HTMLInputElement).value;
  }
  strMatch(string: string | any, substring: any) {
    return string.toLowerCase().includes(substring);
  }
  filter(order: { [x: string]: { toString: () => any } }) {
    const term = this.term.toLowerCase();
    if (term == '') return true;
    var ismatching = false;
    Object.keys(order).forEach((key) => {
      if (typeof order[key] == 'string')
        this.strMatch(order[key], term) ? (ismatching = true) : null;
      if (typeof order[key] == 'number')
        this.strMatch(order[key].toString(), term) ? (ismatching = true) : null;
    });
    return ismatching;
  }
  calculate() {
    this.TotalSales = 0;
    this.Quantity = 0;
    this.FreeQty = 0;
    this.Totalqty = 0;
    this.storewiserpt.Order.filter((x: any) => this.filter(x)).forEach(
      (order: {
        TotalSales: number;
        Quantity: number;
        FreeQty: number;
        Totalqty: number;
      }) => {
        this.TotalSales += order.TotalSales;
        this.Quantity += order.Quantity;
        this.FreeQty += order.FreeQty;
        this.Totalqty += order.Totalqty;
      }
    );
    // console.log(this.term, this.orderwiserpt.Order.filter(x => this.filter(x)).length)
  }

  openDetailpopup(contentdetail: any, Id: any) {
    console.log('contentdetail', contentdetail);
    var frmdate = moment(this.startdate).format('YYYY-MM-DD');
    var todate = moment(this.enddate).format('YYYY-MM-DD');
    console.log(
      this.CompanyId,
      this.categoryId,
      frmdate,
      todate,
      Id,
      this.sourceId
    );
    this.Auth.Getprddata(
      Id,
      frmdate,
      todate,
      this.CompanyId,
      this.sourceId,
      this.categoryId,
      this.tagId
    ).subscribe((data) => {
      this.prdstore = data;
      this.filtprd = data;
      var array: any[] = [];
      console.log(this.prdstore);
      console.log(this.filtprd);
      this.filtprd.data.forEach(
        (element: {
          Id: any;
          TotalSales: any;
          FreeQty: any;
          Quantity: any;
          Totalqty: any;
        }) => {
          if (array.some((x) => x.Id === element.Id)) {
            array.filter((x) => x.Id == element.Id)[0].TotalSales =
              array.filter((x) => x.Id == element.Id)[0].TotalSales +
              element.TotalSales;
            array.filter((x) => x.Id == element.Id)[0].FreeQty =
              array.filter((x) => x.Id == element.Id)[0].FreeQty +
              element.FreeQty;
            array.filter((x) => x.Id == element.Id)[0].Quantity =
              array.filter((x) => x.Id == element.Id)[0].Quantity +
              element.Quantity;
            array.filter((x) => x.Id == element.Id)[0].Totalqty =
              array.filter((x) => x.Id == element.Id)[0].Totalqty +
              element.Totalqty;
          } else {
            array.push(element);
          }
        }
      );
      array.forEach((element) => {
        element.Quantity = +element.Quantity.toFixed(3);
      });

      this.filtprd.data = array;
      this.Auth.GetSalesRpt5(
        Id,
        frmdate,
        todate,
        this.CompanyId,
        this.categoryId,
        this.sourceId.toString(),
        null
      ).subscribe((data) => {
        this.categorywiserpt = data;
        console.log(this.categorywiserpt);
        console.log(this.filteredproducts);
        this.TotalProductSale = 0;
        this.TotalPrdQty = 0;
        for (let i = 0; i < this.filtprd.data.length; i++) {
          this.TotalProductSale =
            this.TotalProductSale + this.filtprd.data[i].TotalSales;
          this.TotalPrdQty = this.TotalPrdQty + this.filtprd.data[i].Totalqty;
          this.TotalProductSale = +this.TotalProductSale.toFixed(2);
          this.TotalPrdQty = +this.TotalPrdQty.toFixed(2);
        }

        this.TotalPrdtSale = 0;
        for (let i = 0; i < this.categorywiserpt.Order.length; i++) {
          this.TotalPrdtSale =
            this.TotalPrdtSale + this.categorywiserpt.Order[i].TotalSales;
          this.TotalPrdtSale = +this.TotalPrdtSale.toFixed(2);
        }
        const modalRef = this.modalService
          .open(contentdetail, {
            ariaLabelledBy: 'modal-basic-title',
            centered: true,
          })
          .result.then(
            (result) => {},
            (reason) => {}
          );
      });
    });
  }
  focusAutocomplete() {
    var xPathResult = document.evaluate(
      '//*[@id="maindiv"]/app-root/app-storewise-rpt/div/div/div[2]/div/section/div[1]/div[1]/ng-autocomplete/div/div[1]/input',
      document,
      null,
      undefined,
      null
    );
    var element: any = null;
    if (xPathResult) {
      element = xPathResult.iterateNext();
    }
    element.focus();
  }
  focusedAutocomplete() {
    var xPathResult = document.evaluate(
      '//*[@id="maindiv"]/app-root/app-storewise-rpt/div/div/div[2]/div/section/div[1]/div[5]/ng-autocomplete/div/div[1]/input',
      document,
      null,
      undefined,
      null
    );
    var element: any = null;
    if (xPathResult) {
      element = xPathResult.iterateNext();
    }
    element.focus();
  }

  hidecontent: boolean = true;
  keycode: string = 'sorrymaintenanceare';
  keyarr: Array<string> = [];
  unlockpagr(key: string) {
    this.keyarr = [...this.keyarr, key];
    if (this.keyarr.length == 3) {
      this.hidecontent = !(this.keyarr.join('') == this.keycode);
      if (this.hidecontent) {
        this.keyarr = [];
      }
    }
  }
}
