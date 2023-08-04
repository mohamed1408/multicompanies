import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import * as moment from 'moment';
import { data } from 'jquery';
import { elementAt } from 'rxjs/operators';
import { ExcelService } from 'src/app/services/excel/excel.service';

declare function setHeightWidth(): any;
@Component({
  selector: 'app-customerdatarpt',
  templateUrl: './customerdatarpt.component.html',
  styleUrls: ['./customerdatarpt.component.css'],
})
export class CustomerdatarptComponent implements OnInit {
  CompanyId: number = 0;
  StoreId: number;
  startdate = moment().format('YYYY-MMM-DD');
  enddate = moment().format('YYYY-MMM-DD');
  selected: any;
  OrderTypeId = 3;
  BillAmount = 0;
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

  limited_user: boolean = true;
  constructor(private Auth: AuthService, private excelservice: ExcelService) {
    this.Auth.limited_user.subscribe((lu) => {
      this.limited_user = lu;
    });
    this.StoreId = 0;
  }

  ngOnInit(): void {
    this.Auth.companyid.subscribe((companyid) => {
      this.CompanyId = companyid;
      // this.Auth.isloading.next(true);
      // this.GetStore();
      // this.GetCustomerList();
      this.Submit();
    });
    setHeightWidth();
    var date = new Date();
    this.startdate = moment().format('YYYY-MM-DD');
    this.enddate = moment().format('YYYY-MM-DD');
  }

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

  cuslist: any;
  ordertypes: any = {
    '1': 'Dine In',
    '2': 'Take Away',
    '3': 'Delivery',
    '4': 'Pick Up',
    '5': 'Quick Order',
    '6': 'SwMato Order',
  };

  Submit() {
    // this.loaderService.show();

    // this.show = true;
    // if (this.startdate.hasOwnProperty('month')) {
    //   this.startdate.month = this.startdate.month - 1;
    //   this.enddate.month = this.enddate.month - 1;
    // }
    this.Auth.isloading.next(true);
    var frmdate = moment(this.startdate).format('YYYY-MM-DD');
    var todate = moment(this.enddate).format('YYYY-MM-DD');
    console.log(this.OrderTypeId);
    this.Auth.getCustListRpt(
      frmdate,
      todate,
      this.CompanyId,
      this.OrderTypeId,
      this.BillAmount
    ).subscribe((data: any) => {
      this.Auth.isloading.next(false);
      console.log(data);
      this.cuslist = data.Order;
      console.log(this.cuslist);
      this.cuslist.forEach((cl: any) => {
        cl.OrderType = this.ordertypes[cl.OrderTypeId.toString()];
      });
      this.importtocus = this.cuslist;
      // this.cuslist.OrderedDate = moment(
      //   this.cuslist.OrderedDate
      // ).format('LLL');
    });
    // this.exportToExcel()
  }

  // GetCustomerList() {
  //   var frmdate = moment(this.startdate).format('YYYY-MM-DD');
  //   var todate = moment(this.enddate).format('YYYY-MM-DD');
  //   console.log(frmdate)
  //   console.log(todate)
  //   this.Auth.getCustListRpt(frmdate, todate, this.CompanyId, 3).subscribe((data : any)=> {
  //     console.log(data)
  //   })
  // }

  exceldata: any = [];
  importtocus: any;
  exportToExcel() {
    // if (this.startdate.hasOwnProperty('month')) {
    //   this.startdate.month = this.startdate.month - 1;
    //   this.enddate.month = this.enddate.month - 1;
    // }
    var frmdate = moment(this.startdate).format('YYYY-MM-DD');
    var todate = moment(this.enddate).format('YYYY-MM-DD');
    console.log(this.OrderTypeId);
    this.Auth.getCustListRpt(
      frmdate,
      todate,
      this.CompanyId,
      this.OrderTypeId,
      this.BillAmount
    ).subscribe((data: any) => {
      console.log(data);
      this.importtocus = data.Order;
      console.log(this.importtocus);

      // this.exceldata = [{ "StoreName": this.importtocus.Store, "CustomerName": this.importtocus.CusName, "PhoneNumber": this.importtocus.CusPhone, "OrderedDate": this.importtocus.OrderedDate, "DeliveryDate": this.importtocus.DeliveryDate }]
      // // this.exceldata = obj
      // this.excelservice.exportAsExcelFile(this.exceldata, 'newexcel')

      this.importtocus.forEach((element: any) => {
        this.exceldata.push({
          StoreName: element.Store,
          CustomerName: element.CusName,
          PhoneNumber: element.CusPhone,
          OrderedDate: element.OrderedDate,
          DeliveryDate: element.DeliveryDate,
          OrderType: element.OrderType
        });
      });
      this.excelservice.exportAsExcelFile(this.exceldata, 'newexcel');
      this.exceldata = [];
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
