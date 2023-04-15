import {
  Component,
  OnInit,
  NgModule,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { FormControl } from '@angular/forms';
// import { AuthService } from '../auth.service';
import * as moment from 'moment';
import { dangertoast } from 'src/assets/dist/js/toast-data';
// import { PdfMakeWrapper, Toc, Txt } from 'pdfmake-wrapper';
// import * as jspdf from 'jspdf';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth.service';
import { Observable } from 'rxjs';

declare function setHeightWidth(): any;
export interface PeriodicElement {
  Name: string;
  Quantity: number;
  FreeQty: number;
  Totalqty: number;
  TotalSales: number;
}
@Component({
  selector: 'app-productwisereport',
  templateUrl: './productwisereport.component.html',
  styleUrls: ['./productwisereport.component.css'],
})
export class ProductwisereportComponent implements OnInit {
  @HostListener('window:keydown', ['$event'])
  newColor(key: any) {
    console.log(key);
  }
  orders: PeriodicElement[] = [];
  displayedColumns: string[] = [
    'Name',
    'Quantity',
    'FreeQty',
    'Totalqty',
    'TotalSales',
  ];
  sources = [
    { id: 1, name: 'POS', isselected: false },
    { id: 2, name: 'Swiggy', isselected: false },
    { id: 3, name: 'Zomato', isselected: false },
  ];
  sourceMS: multiselectConfig;
  storeMS: multiselectConfig = new multiselectConfig([], () => {});
  selected_sources: string;
  source_key: string = '';
  @ViewChild('TABLE', { static: false })
  TABLE!: ElementRef;
  title = 'Excel';
  sortfield: any;
  x: number = 0;
  y: number = 0;
  datatype: boolean = false;
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.TABLE.nativeElement
    );
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'report.xlsx');
  }
  productrpt: any = [];
  CompanyId: number = 0;
  startdate: any;
  enddate: any;
  StoreId: number = 0;
  show: boolean = true;
  myControl = new FormControl();
  stores: any;
  selected_stores: string = '';
  showdropdown: Observable<boolean>;
  key = 'Name';
  all: boolean = false;
  term: string = '';
  p: any;
  selected: any;
  TotalSale = 0;
  Quantity = 0;
  FreeQty = 0;
  Totalqty = 0;
  percent = 0;
  totalmargin = 0;
  totalmargin_percentage = 0;
  categ: any;
  CategoryId = 0;
  sourceId = 0;
  filteredstores: any;
  productstore: any;
  storeprd: any;
  productwisedata = [];
  categoryId: any;
  storewiserpt: any;
  TotalProductSale = 0;
  TotalPrdQty = 0;
  cgst: any;
  sgst: any;
  subtotal: any;
  total: any;
  showloading = false;
  discount: any;
  // content:any;
  // container: any;
  alwaysShowCalendars: boolean;
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
  // selected: any = { startDate: moment().subtract(29, 'days'), endDate: moment() };
  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some((d) => d.isSame(m, 'day'));
  };
  data: any;
  errorMsg: string = '';
  salespercent: number = 0;
  tags: any;
  tagId = 0;
  isactive: boolean = false;
  islocal: boolean = false;
  showfactor: boolean = false;
  constructor(private Auth: AuthService, private modalService: NgbModal) {
    this.alwaysShowCalendars = true;
    this.showdropdown = Auth.showdropdown;
    this.selected_sources = '';
    this.sourceMS = new multiselectConfig(this.sources, (data: any) => {
      // console.log(data);
      this.source_key = data.map((x: any) => x.id).join('_');
      this.sourceMS.show_string = data.map((x: any) => x.name).join(', ');
    });
    // var userinfo = localStorage.getItem("userinfo");
    // var userinfoObj = JSON.parse(userinfo);
    // this.CompanyId = userinfoObj[0].CompanyId;
    // var logInfo = JSON.parse(localStorage.getItem("loginInfo"));
    // this.CompanyId = logInfo.CompanyId;
    // this.StoreId = logInfo.storeId;
  }
  localOrders: any = [];
  localOrderItems: any = [];
  storekey: string = '';
  ngOnInit() {
    this.Auth.companyid.subscribe((companyid) => {
      this.CompanyId = companyid;
      this.GetStore();
      // this.Submit();
      this.getCategory();
      this.gettags();
      this._localorders();
      this.getSaleProducts();
    });
    // this.loaderService.show();
    setHeightWidth();
    // var date = new Date();
    // this.startdate = {"year":date.getFullYear(),"month":date.getMonth()+1,"day":date.getDate()};
    // this.enddate = {"year":date.getFullYear(),"month":date.getMonth()+1,"day":date.getDate()};
    // this.submit1();
  }
  getBase64Image(img: any) {
    console.log(img);
    var canvas = document.createElement('canvas');
    // console.log("image");
    // canvas.width = img.width;
    // canvas.height = img.height;
    var ctx: any = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL('image/png');
    return dataURL;
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
    return this.report.sort((a: any, b: any) => {
      if (a[this.sortfield] < b[this.sortfield]) return this.x;
      else if (a[this.sortfield] > b[this.sortfield]) return this.y;
      else return 0;
    });
  }
  factoredQuantity = 0;
  Submit() {
    // this.loaderService.show();
    this.Auth.isloading.next(true);
    this.show = true;
    if (this.startdate && this.startdate.hasOwnProperty('month')) {
      this.startdate.month = this.startdate.month - 1;
      this.enddate.month = this.enddate.month - 1;
    }
    var frmdate = moment(this.startdate).format('YYYY-MM-DD');
    var todate = moment(this.enddate).format('YYYY-MM-DD');
    // console.log('this.StoreId, frmdate, todate, this.CompanyId, this.CategoryId, this.sourceId,this.tagId'
    // ,this.StoreId, frmdate, todate, this.CompanyId, this.CategoryId, this.sourceId,this.tagId);

    this.Auth.GetproductRpt(
      this.StoreId,
      frmdate,
      todate,
      this.CompanyId,
      this.CategoryId,
      this.source_key,
      this.tagId,
      this.datatype ? 2 : 1,
      this.storekey
    ).subscribe((data) => {
      this.showloading = false;
      if (this.tagId > 0) this.showfactor = true;
      else this.showfactor = false;
      this.data = data;
      this.productrpt = this.data.data;
      console.log(this.productrpt);
      if (this.productrpt == null) this.productrpt = [];
      this.Auth.GetOptions(this.CompanyId).subscribe((data) => {
        this.options = data;
        this.productrpt.forEach((element: any) => {
          console.log(element.Options);
          if (element.OptionJson != undefined) {
            element.OptionJson = JSON.parse(element.OptionJson);
          } else {
            element.OptionJson = {
              quantity: element.Quantity,
              amount: element.TotalSales,
              key: '',
              options: [],
            };
          }
          element.OptionJson.options.forEach((opt: any) => {
            opt.Quantity = element.Quantity;
            opt.Name = this.options.filter((x: any) => x.Id == opt.Id)[0].Name;
          });
        });
        // this.group_data();
      });
      // console.log(this.productrpt)
      this.TotalSale = 0;
      this.Quantity = 0;
      this.FreeQty = 0;
      this.Totalqty = 0;
      this.percent = 0;
      this.factoredQuantity = 0;
      this.totalmargin = 0;
      this.totalmargin_percentage = 0;

      for (let i = 0; i < this.productrpt.length; i++) {
        // this.productrpt[i].OrderedDate = moment(this.productrpt[i].OrderedDate).format('LL');
        this.TotalSale = this.TotalSale + this.productrpt[i].TotalSales;
        this.Quantity = this.Quantity + this.productrpt[i].Quantity;
        this.FreeQty = this.FreeQty + this.productrpt[i].FreeQty;
        this.Totalqty = this.Totalqty + this.productrpt[i].Totalqty;
        this.factoredQuantity += this.productrpt[i].FactoredQty;
        this.productrpt[i].Margin =
          this.productrpt[i].TotalSales - this.productrpt[i].TotalMakingCost;
        this.productrpt[i].Margin_per =
          (this.productrpt[i].Margin * 100) / this.productrpt[i].TotalSales;
        this.totalmargin += this.productrpt[i].Margin;
        console.log(
          this.productrpt[i].Quantity,
          this.productrpt[i].Factor,
          this.factoredQuantity,
          this.productrpt[i].Margin,
          this.productrpt[i].Margin_per,
          this.totalmargin
        );
      }
      this.totalmargin_percentage = (this.totalmargin * 100) / this.TotalSale;
      this.TotalSale = +this.TotalSale.toFixed(2);
      this.Quantity = +this.Quantity.toFixed(2);
      this.FreeQty = +this.FreeQty.toFixed(2);
      this.Totalqty = +this.Totalqty.toFixed(2);
      this.totalmargin = +this.totalmargin.toFixed(2);
      this.totalmargin_percentage = +this.totalmargin_percentage.toFixed(2);
      console.log('Final Values');
      console.log(
        this.TotalSale,
        this.totalmargin,
        this.totalmargin_percentage + ' %'
      );
      this.productrpt.forEach((element: any) => {
        element.percentage = +(
          (element.TotalSales * 100) /
          this.TotalSale
        ).toFixed(2);
      });
      for (let i = 0; i < this.productrpt.length; i++) {
        this.percent = this.percent + this.productrpt[i].percentage;
      }
      var response: any = data;
      if (response.status == 0) {
        this.errorMsg = response.msg;
        console.log(dangertoast(this.errorMsg));
      }
      // this.loaderService.hide();
      this.Auth.isloading.next(false);
    });
  }
  strMatch(string: string, substring: string) {
    // console.log(string, substring)
    return string.toLowerCase().includes(substring);
  }
  filter(obj: any) {
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
  saleProducts: any = [];
  getSaleProducts() {
    this.Auth.getSaleProducts(this.CompanyId).subscribe((data) => {
      console.log(data);
      var response: any = data;
      this.saleProducts = response.products;
    });
  }

  calculate() {
    this.TotalSale = 0;
    this.Quantity = 0;
    this.FreeQty = 0;
    this.Totalqty = 0;
    this.percent = 0;
    this.totalmargin = 0;
    this.totalmargin_percentage = 0;

    this.productrpt
      .filter((x: any) => this.filter(x))
      .forEach((pd: any) => {
        this.TotalSale += pd.TotalSales;
        this.Quantity += pd.Quantity;
        this.FreeQty += pd.FreeQty;
        this.Totalqty += pd.Totalqty;
        this.totalmargin += pd.Margin;
      });
    this.totalmargin_percentage = (this.totalmargin * 100) / this.TotalSale;
    this.TotalSale = +this.TotalSale.toFixed(2);
    this.Quantity = +this.Quantity.toFixed(2);
    this.FreeQty = +this.FreeQty.toFixed(2);
    this.Totalqty = +this.Totalqty.toFixed(2);
    this.totalmargin = +this.totalmargin.toFixed(2);
    this.totalmargin_percentage = +this.totalmargin_percentage.toFixed(2);
    // console.log(this.term, this.productrpt.filter(x => this.filter(x)))
  }
  report: any = [];
  group_data() {
    this.report = [];
    this.productrpt.forEach((element: any) => {
      if (this.report.some((x: any) => x.Id === element.Id)) {
        var index = this.report.findIndex((x: any) => x.Id === element.Id);
        this.report[index].FreeQty =
          this.report[index].FreeQty + element.FreeQty;
        this.report[index].Quantity =
          this.report[index].Quantity + element.Quantity;
        this.report[index].Totalqty =
          this.report[index].Totalqty + element.Totalqty;
        element.OptionJson.options.forEach((option: any) => {
          if (
            this.report[index].OptionJson.options.some(
              (x: any) => x.Id === option.Id
            )
          ) {
            var opt_index = this.report[index].OptionJson.options.findIndex(
              (x: any) => x.Id === option.Id
            );
            this.report[index].OptionJson.options[opt_index].Quantity =
              this.report[index].OptionJson.options[opt_index].Quantity +
              element.OptionJson.quantity;
          } else {
            this.report[index].OptionJson.options.push(option);
          }
        });
      } else {
        this.report.push(element);
      }
    });
    this.report.forEach((element: any) => {
      element.OptionJson.options.forEach((option: any) => {
        option.Amount =
          this.options.filter((x: any) => x.Id == option.Id)[0].Price *
          option.Quantity;
      });
    });
    console.log(this.report);
  }
  options: any = [];
  localOrderReport: any = [];
  localOrderTotal = { quantity: 0, freequantity: 0, amount: 0 };
  localOrderTerm: string = '';
  _localorders() {
    this.localOrderTotal = { quantity: 0, freequantity: 0, amount: 0 };
    this.localOrderItems = [];
    this.localOrderReport = [];
    this.Auth.getlocalorders().subscribe((data: any) => {
      console.log(data);
      this.localOrders = data['tableorders'];
      this.localOrders.forEach((order: any) => {
        this.localOrderItems = [...this.localOrderItems, ...order.Items];
      });
      console.log(this.localOrders, this.localOrderItems);
      this.localOrderItems.forEach((item: any) => {
        this.localOrderTotal.quantity += item.Quantity;
        this.localOrderTotal.freequantity += item.ComplementryQty;
        this.localOrderTotal.amount += item.TotalAmount;
        if (
          this.localOrderReport.some(
            (x: any) => x.ProductKey == item.ProductKey
          )
        ) {
          this.localOrderReport.filter(
            (x: any) => x.ProductKey == item.ProductKey
          )[0].Quantity += item.Quantity;
          this.localOrderReport.filter(
            (x: any) => x.ProductKey == item.ProductKey
          )[0].ComplementryQty += item.ComplementryQty;
          this.localOrderReport.filter(
            (x: any) => x.ProductKey == item.ProductKey
          )[0].TotalAmount += item.TotalAmount;
        } else {
          this.localOrderReport.push(item);
        }
      });
    });
  }

  _filter(obj: any) {
    const term = this.localOrderTerm.toLowerCase();
    if (term == '') return true;
    var ismatching = false;
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] == 'string') {
        this.strMatch(obj[key], term) ? (ismatching = true) : null;
      }
      if (typeof obj[key] == 'number')
        this.strMatch(obj[key].toString(), term) ? (ismatching = true) : null;
      if (typeof obj[key] == 'object')
        this._filter(obj[key]) ? (ismatching = true) : null;
    });
    return ismatching;
  }

  calculateLocalOrder() {
    this.localOrderTotal = { quantity: 0, freequantity: 0, amount: 0 };
    this.localOrderReport
      .filter((x: any) => this._filter(x))
      .forEach((report: any) => {
        this.localOrderTotal.quantity += report.Quantity;
        this.localOrderTotal.freequantity += report.ComplementryQty;
        this.localOrderTotal.amount += report.TotalAmount;
      });
  }
  All() {
    this.startdate = moment().format('YYYY-MM-DD  00:00:00');
    this.enddate = moment().format('YYYY-MM-DD  23:59:59');
    this.Auth.GetproductRpt(
      0,
      this.startdate,
      this.enddate,
      this.CompanyId,
      this.CategoryId,
      this.source_key,
      this.tagId,
      this.datatype ? 2 : 1,
      ''
    ).subscribe((data) => {
      this.data = data;
      console.log(this.data);
      this.productrpt = this.data.data;
      this.Auth.GetOptions(this.CompanyId).subscribe((data) => {
        this.options = data;
        this.productrpt.forEach((element: any) => {
          if (element.OptionJson != undefined) {
            element.OptionJson = JSON.parse(element.OptionJson);
          } else {
            element.OptionJson = {
              quantity: element.Quantity,
              amount: element.TotalSales,
              key: '',
              options: [],
            };
          }
          element.OptionJson.options.forEach((opt: any) => {
            opt.Quantity = element.Quantity;
            opt.Name = this.options.filter((x: any) => x.Id == opt.Id)[0].Name;
          });
        });
        this.group_data();
      });
      // console.log(this.productrpt)
      this.TotalSale = 0;
      this.Quantity = 0;
      this.FreeQty = 0;
      this.Totalqty = 0;
      this.percent = 0;
      this.sgst = 0;
      this.cgst = 0;
      this.subtotal = 0;
      this.discount = 0;
      this.totalmargin = 0;
      this.totalmargin_percentage = 0;

      this.productrpt.forEach((element: any) => {
        this.cgst = this.cgst + (element.tax1 * element.Price) / 100;
        this.sgst = this.sgst + (element.tax2 * element.Price) / 100;
        this.subtotal = element.TotalSales + this.subtotal;
        this.discount = element.DiscAmount;
        this.total = this.subtotal + this.sgst + this.cgst;
        element.Margin = element.TotalSales - element.TotalMakingCost;
        element.Margin_per = (element.Margin * 100) / element.TotalSales;
        this.totalmargin += element.Margin;
      });
      this.cgst = +this.cgst.toFixed(2);
      this.sgst = +this.sgst.toFixed(2);
      this.subtotal = +this.subtotal.toFixed(2);
      for (let i = 0; i < this.productrpt.length; i++) {
        console.log(
          this.productrpt[1].Product + '        ' + this.productrpt[1].Quantity
        );
        this.TotalSale = this.TotalSale + this.productrpt[i].TotalSales;
        this.Quantity = this.Quantity + this.productrpt[i].Quantity;
        this.FreeQty = this.FreeQty + this.productrpt[i].FreeQty;
        this.Totalqty = this.Totalqty + this.productrpt[i].Totalqty;
      }
      console.log(
        this.productrpt[1].Product + '        ' + this.productrpt[1].Quantity
      );
      this.totalmargin_percentage = (this.totalmargin * 100) / this.TotalSale;
      this.TotalSale = +this.TotalSale.toFixed(2);
      this.Quantity = +this.Quantity.toFixed(2);
      this.FreeQty = +this.FreeQty.toFixed(2);
      this.Totalqty = +this.Totalqty.toFixed(2);
      this.totalmargin = +this.totalmargin.toFixed(2);
      this.totalmargin_percentage = +this.totalmargin_percentage.toFixed(2);
      this.productrpt.forEach((element: any) => {
        element.percentage = +(
          (element.TotalSales * 100) /
          this.TotalSale
        ).toFixed(2);
      });
      for (let i = 0; i < this.productrpt.length; i++) {
        this.percent = this.percent + this.productrpt[i].percentage;
      }
      var response: any = data;
      if (response.status == 0) {
        this.errorMsg = response.msg;
        console.log(dangertoast(this.errorMsg));
      }
      this.showloading = false;
      // this.loaderService.hide();
      console.log(
        this.productrpt[1].Product + '        ' + this.productrpt[1].Quantity
      );
    });
  }

  selectEvent(e: any) {
    this.StoreId = e.Id;
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
      this.stores.push(obj);
      var response: any = data;
      if (response.status == 0) {
        this.errorMsg = response.msg;
        console.log(dangertoast(this.errorMsg));
      }
      this.storeMS = new multiselectConfig(data, (stores: any) => {
        this.storekey = stores.map((x: any) => x.Id).join('_');
        this.storeMS.show_string = stores.map((x: any) => x.Name).join(', ');
      });
    });
  }
  gettags() {
    this.Auth.getTag(this.CompanyId).subscribe((data) => {
      this.tags = data;
    });
  }
  setTagId(tagId: any) {
    this.tagId = tagId;
  }
  date(e: any) {
    if (e.startDate && e.endDate) {
      this.startdate = e.startDate.format('YYYY-MM-DD');
      this.enddate = e.endDate.format('YYYY-MM-DD');
    }
  }
  getCategory() {
    this.Auth.getcat(this.CompanyId).subscribe((data) => {
      this.categ = data;
    });
  }

  openDetailpopup(contentdetail: any, productId: any) {
    console.log(productId);
    var frmdate = moment(this.startdate).format('YYYY-MM-DD');
    var todate = moment(this.enddate).format('YYYY-MM-DD');
    this.Auth.GetSalesRpt6(
      this.categoryId,
      frmdate,
      todate,
      this.CompanyId,
      this.sourceId,
      productId,
      this.tagId
    ).subscribe((data) => {
      this.storewiserpt = data;
      console.log(this.storewiserpt);
      this.storeprd = data;
      this.TotalProductSale = 0;
      this.TotalPrdQty = 0;
      for (let i = 0; i < this.storeprd.Order.length; i++) {
        this.TotalProductSale =
          this.TotalProductSale + this.storeprd.Order[i].TotalSales;
        this.TotalPrdQty = this.TotalPrdQty + this.storeprd.Order[i].Totalqty;
      }
      this.TotalProductSale = +this.TotalProductSale.toFixed(2);
      this.TotalPrdQty = +this.TotalPrdQty.toFixed(2);

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
      '//*[@id="maindiv"]/app-root/app-prd-wise-sales-rpt/div/div/div[2]/div/section/div[1]/div[1]/ng-autocomplete/div/div[1]/input',
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
  active(id: any, act: any) {
    //   if(act="undefined")
    //   {
    //     act=true;
    //   }
    //   this.Id =id;
    // this.isactive =act;
    console.log('yyyyyyyy');
  }

  hidecontent: boolean = true;
  keycode: string = 'sorrymaintenanceare';
  keyarr: Array<string> = [];
  unlockpagr(key: any) {
    this.keyarr = [...this.keyarr, key];
    if (this.keyarr.length == 3) {
      this.hidecontent = !(this.keyarr.join('') == this.keycode);
      if (!this.hidecontent) {
        this.GetStore();
        this.Submit();
        this.getCategory();
        this.gettags();
        this._localorders();
        this.getSaleProducts();
      }
    }
  }

  //multi select
  select(i: number) {
    console.log(i);
  }

  toggleDropDown() {
    this.Auth.showdropdown.next(true);
  }

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

  toggleAll() {
    this.stores.forEach((element: any) => {
      element.isselected = this.all;
    });
    this.change();
  }

  //source multiselect
  onload(component: string) {
    console.log(component);
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
