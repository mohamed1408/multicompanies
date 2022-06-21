import {
  Component,
  OnInit,
  NgModule,
  ElementRef,
  ViewChild,
} from '@angular/core';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-monthwiseproductreport',
  templateUrl: './monthwiseproductreport.component.html',
  styleUrls: ['./monthwiseproductreport.component.css'],
})
export class MonthwiseproductreportComponent implements OnInit {
  CompanyId: number = 0;
  TotalSales: number = 0;
  alwaysShowCalendars: boolean;
  startdate: any;
  enddate: any;
  sourceId = 1;
  stores: any;
  errorMsg: string = '';
  status: number = 0;
  storeId: any;
  key7 = 'Name';
  monthrpt: any;
  str: string = 'All';
  Interval = 0;
  StartTime: any;
  EndTime: any;
  mytime: Date = new Date();
  sortfield: any;
  x: number = 0;
  y: number = 0;
  product: any;
  showloading = true;
  categ: any;
  prd: string = 'All';
  key2 = 'Name';
  categoryId = 0;
  productId = 0;
  term: any;
  Groupby: string = '';
  key = 'Name';
  all: any;
  sortsettings: any;
  billWise: boolean = true;
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
  selected: any = {
    startDate: moment().subtract(1, 'month').startOf('month'),
    endDate: moment(),
  };
  invalidDates: moment.Moment[] = [
    moment().add(2, 'days'),
    moment().add(3, 'days'),
    moment().add(5, 'days'),
  ];
  myControl: any;
  ProdNStore: any;
  CatNStore: any;
  ParCatNStore: any;
  monthsToSub: number = 1;
  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some((d) => d.isSame(m, 'day'));
  };

  constructor(private Auth: AuthService, private modalService: NgbModal) {
    this.alwaysShowCalendars = true;
    // var logInfo = JSON.parse(localStorage.getItem('loginInfo'));
    // this.CompanyId = logInfo.CompanyId;
  }

  ngOnInit() {
    this.Auth.companyid.subscribe((companyid) => {
      this.CompanyId = companyid;
      // this.Auth.isloading.next(true);
      console.log(this.billWise);
      this.GetStore();
      this.getCategory();
      this.startdate = moment().subtract(1, 'month').startOf('month');
      this.enddate = moment().format('YYYY-MM-DD');
      this.GetProduct();
      this.All();
    });
  }

  setStartDate() {
    if (this.monthsToSub > 0) {
      this.startdate = moment()
        .subtract(this.monthsToSub, 'month')
        .startOf('month');
      this.selected = {
        startDate: moment()
          .subtract(this.monthsToSub, 'month')
          .startOf('month'),
        endDate: moment(),
      };
    }
  }

  date(e: any) {
    console.log(e);
    if (e.startDate != null && e.endDate != null) {
      this.startdate = e.startDate.format('YYYY-MM-DD');
      this.enddate = e.endDate.format('YYYY-MM-DD');
    }
  }
  selectEvent(e: any) {
    this.storeId = e.Id;
  }

  selectedEvent(ed: any) {
    this.productId = ed.Id;
  }

  GetStore() {
    this.Auth.GetStoreName(this.CompanyId).subscribe((data) => {
      this.stores = data;
      var obj = {
        Id: 0,
        Name: 'All',
        ParentStoreId: null,
        ParentStore: null,
        IsMainStore: false,
      };
      this.stores.unshift(obj);
      console.log(this.stores);
      this.showloading = false;
    });
  }

  getCategory() {
    this.Auth.getcat(this.CompanyId).subscribe((data) => {
      this.categ = data;
      console.log(this.categ);
    });
  }

  GetProduct() {
    this.Auth.getcatprd(this.CompanyId).subscribe((data) => {
      this.product = data;
      var obj = { Id: 0, Name: 'All', ParentCategoryId: null };
      this.product.push(obj);
    });
  }

  Submit(text: string) {
    this.Groupby = text;
    if (this.startdate.hasOwnProperty('month')) {
      this.startdate.month = this.startdate.month - 1;
      this.enddate.month = this.enddate.month - 1;
    }
    var frmdate = moment(this.startdate).format('YYYY-MM-DD');
    var todate = moment(this.enddate).format('YYYY-MM-DD');
    console.log(
      this.storeId,
      frmdate,
      todate,
      this.sourceId,
      this.categoryId,
      this.productId
    );
    this.Auth.MonthSalesRpt(
      this.storeId,
      frmdate,
      todate,
      this.sourceId,
      this.Groupby,
      this.CompanyId,
      this.categoryId,
      this.productId
    ).subscribe((data: any) => {
      this.monthrpt = data;
      console.log(this.monthrpt);
    });
  }
  All() {
    this.Groupby = 'ProdNStore';
    if (this.startdate.hasOwnProperty('month')) {
      this.startdate.month = this.startdate.month - 1;
      this.enddate.month = this.enddate.month - 1;
    }
    var frmdate = moment(this.startdate).format('YYYY-MM-DD');
    var todate = moment(this.enddate).format('YYYY-MM-DD');
    console.log(
      this.storeId,
      frmdate,
      todate,
      this.sourceId,
      this.categoryId,
      this.productId
    );
    this.Auth.MonthSalesRpt(
      this.storeId,
      frmdate,
      todate,
      this.sourceId,
      this.Groupby,
      this.CompanyId,
      this.categoryId,
      this.productId
    ).subscribe((data: any) => {
      this.monthrpt = data;
      console.log(this.monthrpt);
      this.showloading = false;
    });
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
}
