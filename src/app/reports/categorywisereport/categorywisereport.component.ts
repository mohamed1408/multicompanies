import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-categorywisereport',
  templateUrl: './categorywisereport.component.html',
  styleUrls: ['./categorywisereport.component.css'],
})
export class CategorywisereportComponent implements OnInit {
  CompanyId: number = 0;
  StoreId: number = 0;
  ParentCatId = 0;
  CatId = 0;
  catId: number = 0;
  storeId: any;
  sourceId = 0;
  // all: string = 'All';
  all: boolean = false;
  stores: any;
  category: any;
  alwaysShowCalendars: boolean;
  key = 'Name';
  key2 = 'Description';
  startdate: any;
  enddate: any;
  show: boolean = true;
  categorywiserpt: any;
  prdstore: any;
  filtprd: any;
  ParentCategoryId: any;
  parentcategory: any = [];
  TotalSales = 0;
  TotalProductSale = 0;
  TotalPrdQty = 0;
  showloading = true;
  term = '';
  p: any;
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

  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some((d) => d.isSame(m, 'day'));
  };
  data: any;
  sortfield: any;
  x: number = 0;
  y: number = 0;

  showdropdown: Observable<boolean>;
  sources = [
    { id: 1, name: 'POS', isselected: false },
    { id: 2, name: 'Swiggy', isselected: false },
    { id: 3, name: 'Zomato', isselected: false },
  ];
  sourceMS: multiselectConfig;
  storeMS: multiselectConfig = new multiselectConfig([], () => {});
  source_key: string = '';
  mergereport: boolean = true;
  drawerOpen: boolean = false;

  constructor(private Auth: AuthService, private modalService: NgbModal) {
    this.alwaysShowCalendars = true;
    this.showdropdown = Auth.showdropdown;
    this.sourceMS = new multiselectConfig(this.sources, (data: any) => {
      this.source_key = data.map((x: any) => x.id).join('_');
      this.sourceMS.show_string = data.map((x: any) => x.name).join(', ');
    });
  }

  ngOnInit() {
    this.Auth.companyid.subscribe((companyid) => {
      this.CompanyId = companyid;
      // this.Auth.isloading.next(true);
      this.startdate = this.startdate
        ? this.startdate
        : moment().format('YYYY-MM-DD');
      this.enddate = this.enddate
        ? this.enddate
        : moment().format('YYYY-MM-DD');
      this.All();
      this.GetStores();
      this.Getcategory();
    });
  }
  Submit() {
    this.Auth.isloading.next(true);
    this.show = true;
    if (this.startdate.hasOwnProperty('month')) {
      this.startdate.month = this.startdate.month - 1;
      this.enddate.month = this.enddate.month - 1;
    }
    var frmdate = moment(this.startdate).format('YYYY-MM-DD');
    var todate = moment(this.enddate).format('YYYY-MM-DD');
    console.log(
      this.storeId + 'frm' + frmdate + '' + todate + 'sourceId' + this.sourceId
    );
    this.Auth.GetSalesRpt5(
      -1,
      frmdate,
      todate,
      this.CompanyId,
      this.ParentCatId,
      this.source_key,
      this.storekey
    ).subscribe((data) => {
      this.Auth.isloading.next(false);
      this.categorywiserpt = data;
      console.log(this.categorywiserpt);
      this.format_report();
    });
  }
  strMatch(string: string, substring: string) {
    // console.log(string, substring)
    return string.toLowerCase().includes(substring);
  }
  filter(obj: { [x: string]: any }) {
    const term = this.term.toLowerCase();
    if (term == '') return true;
    var ismatching = false;
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] == 'string') {
        this.strMatch(obj[key], term) ? (ismatching = true) : null;
      }
      if (typeof obj[key] == 'number')
        this.strMatch(obj[key].toString(), term) ? (ismatching = true) : null;
      if (typeof obj[key] == 'object')
        this.filter(obj[key]) ? (ismatching = true) : null;
    });
    return ismatching;
  }

  calculate() {
    this.TotalSales = 0;
    this.categorywiserpt.Order.filter((x: any) => this.filter(x)).forEach(
      (pd: { TotalSales: number }) => {
        this.TotalSales += pd.TotalSales;
      }
    );
    this.TotalSales = +this.TotalSales.toFixed(2);
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
    return this.categorywiserpt.Order.sort(
      (a: { [x: string]: number }, b: { [x: string]: number }) => {
        if (a[this.sortfield] < b[this.sortfield]) return this.x;
        else if (a[this.sortfield] > b[this.sortfield]) return this.y;
        else return 0;
      }
    );
  }

  All() {
    var frmdate = moment().format('YYYY-MM-DD  00:00:00');
    var todate = moment().format('YYYY-MM-DD  23:59:59');
    this.Auth.GetSalesRpt5(
      -1,
      this.startdate,
      this.enddate,
      this.CompanyId,
      this.ParentCatId,
      this.source_key,
      this.storekey
    ).subscribe((data) => {
      this.categorywiserpt = data;
      console.log(this.categorywiserpt);
      this.format_report();
      this.showloading = false;
    });
  }
  childReport: any = {
    title: "",
    report: []
  };
  viewChildReport(cr: any) {
    this.childReport = {title: cr.Category, report: cr.childreport}
    this.drawerOpen = true
  }
  format_report() {
    console.log('Formating report');
    let parentreport: any[] = [];
    this.TotalSales = 0;
    this.categorywiserpt.Order.forEach((rpt: any) => {
      rpt.OrderedDate = moment(rpt.OrderedDate).format('ll');
      this.TotalSales = this.TotalSales + rpt.TotalSales;
      console.log(
        rpt.StoreId == rpt.ParentStoreId ? 'Parent Store' : 'Child Store'
      );
      if (
        !parentreport.some(
          (x) =>
            x.StoreId == rpt.ParentStoreId && x.CategoryId == rpt.CategoryId
        )
      ) {
        parentreport.push({
          Store: rpt.ParentStoreName,
          StoreId: rpt.ParentStoreId,
          Category: rpt.Category,
          CategoryId: rpt.CategoryId,
          StoreSale: rpt.StoreSale,
          TotalSales:
            rpt.StoreId == rpt.ParentStoreId
              ? rpt.TotalSales
              : this.categorywiserpt.Order.filter(
                  (x: any) =>
                    x.ParentStoreId == rpt.ParentStoreId &&
                    x.CategoryId == rpt.CategoryId
                )
                  .map((x: any) => x.TotalSales)
                  .reduce((a: any, b: any) => a + b, 0),
          childreport:
            rpt.StoreId == rpt.ParentStoreId
              ? []
              : this.categorywiserpt.Order.filter(
                  (x: any) =>
                    x.ParentStoreId == rpt.ParentStoreId &&
                    x.CategoryId == rpt.CategoryId
                ),
        });
      }
    });
    console.log(parentreport);
    this.categorywiserpt.Order = parentreport;
    this.TotalSales = +this.TotalSales.toFixed(2);
  }

  selectEvent(e: { Id: any }) {
    this.storeId = e.Id;
  }

  selectedEvent(e: { Id: number }) {
    this.catId = e.Id;
  }

  date(
    e:
      | {
          startDate: { format: (arg0: string) => any };
          endDate: { format: (arg0: string) => any };
        }
      | any
  ) {
    this.startdate = e.startDate.format('YYYY-MM-DD');
    this.enddate = e.endDate.format('YYYY-MM-DD');
  }

  GetStores() {
    this.Auth.GetStoreName(this.CompanyId).subscribe((data) => {
      this.stores = data;
      var obj = {
        Id: 0,
        Name: 'All',
        ParentStoreId: null,
        ParentStore: null,
        IsMainStore: false,
      };
      this.stores.push(obj);
      console.log(this.stores);
      this.storeMS = new multiselectConfig(data, (stores: any) => {
        this.storekey = stores.map((x: any) => x.Id).join('_');
        this.storeMS.show_string = stores.map((x: any) => x.Name).join(', ');
      });
    });
  }

  Getcategory() {
    this.Auth.getcat(this.CompanyId).subscribe((data) => {
      this.category = data;
      console.log(this.category);

      var obj = { Id: 0, Description: 'All', ParentCategoryId: null };
      this.category.unshift(obj);
      this.parentcategory = this.category.filter(
        (x: { ParentCategoryId: null }) => x.ParentCategoryId == null
      );
      console.log(this.parentcategory);
    });
  }
  openDetailpopup(contentdetail: any, Id: any) {
    var frmdate = moment(this.startdate).format('YYYY-MM-DD');
    var todate = moment(this.enddate).format('YYYY-MM-DD');
    console.log(
      this.CompanyId,
      this.storeId,
      frmdate,
      todate,
      Id,
      this.sourceId
    );
    this.Auth.Getprddata(
      this.storeId,
      frmdate,
      todate,
      this.CompanyId,
      this.sourceId,
      Id,
      0
    ).subscribe((data: any) => {
      this.prdstore = data;
      this.filtprd = data;
      console.log(this.prdstore);
      console.log(this.filtprd);
      this.TotalProductSale = 0;
      this.TotalPrdQty = 0;
      for (let i = 0; i < this.filtprd.data.length; i++) {
        this.TotalProductSale =
          this.TotalProductSale + this.filtprd.data[i].TotalSales;
        this.TotalPrdQty = this.TotalPrdQty + this.filtprd.data[i].Totalqty;
      }
      this.TotalProductSale = +this.TotalProductSale.toFixed(2);
      this.TotalPrdQty = +this.TotalPrdQty.toFixed(2);
      console.log(this.TotalProductSale, this.TotalPrdQty);
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
  }
  focusAutocomplete() {
    var xPathResult = document.evaluate(
      '//*[@id="maindiv"]/app-root/app-category-wise-rpt/div/div/div[2]/div/section/div[1]/div[1]/ng-autocomplete/div[1]/div[1]/input',
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
  selected_stores: string = '';
  storekey: string = '';
  change(bool: boolean = true) {
    // console.log(bool);
    this.selected_stores = this.stores
      .filter((x: any) => x.isselected)
      .map((x: any) => x.Name)
      .join(', ');
    console.log(this.selected_stores);
    this.storekey = this.stores
      .filter((x: any) => x.isselected)
      .map((x: any) => x.Id)
      .join('_');
    // this.Auth.selectedcompanies.next(
    //   this.stores
    //     .filter((x: any) => x.isselected)
    //     .map((x: any) => x.CompanyId)
    // );
  }
  toggleDropDown() {
    this.Auth.showdropdown.next(true);
  }
  toggleAll() {
    this.stores.forEach((element: any) => {
      element.isselected = this.all;
    });
    this.change();
  }
}
class multiselectConfig {
  // @HostListener('keydown') newColor(key: any) {
  //   console.log(key)
  // }
  data: any;
  all: boolean;
  show_string: string;
  show_panel: boolean;

  constructor(_data: any, public change_callback: any) {
    this.data = _data;
    this.all = false;
    this.show_string = '';
    this.show_panel = false;
  }

  toggleAll() {
    this.data.forEach((element: any) => {
      element.isselected = this.all;
    });
    this.change();
  }

  change(bool: boolean = true) {
    if (this.data.length == this.data.filter((x: any) => x.isselected).length)
      this.all = true;
    else this.all = false;
    this.change_callback(this.data.filter((x: any) => x.isselected));
  }
}
