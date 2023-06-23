import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth.service';
import { dangertoast } from 'src/assets/dist/js/toast-data';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-kb2chef',
  templateUrl: './kb2chef.component.html',
  styleUrls: ['./kb2chef.component.css']
})
export class Kb2chefComponent implements OnInit {

  all: string = 'All';
  alwaysShowCalendars: boolean;
  limited_user: boolean = true;
  StoreId: number;
  CompanyId: number = 0;
  selected: any;
  stores: any;
  errorMsg: string = '';
  status!: number;
  myControl = new FormControl();
  key = 'Name';
  term: string = '';
  storeId: any;
  startdate: any;
  enddate: any;

  orders: any

  constructor(private Auth: AuthService, private modalService: NgbModal) {
    this.alwaysShowCalendars = true;
    this.Auth.limited_user.subscribe((lu) => {
      this.limited_user = lu;
    });
    this.StoreId = 0;
  }

  ngOnInit(): void {
    this.Auth.companyid.subscribe((companyid) => {
      this.CompanyId = companyid;
      this.Auth.isloading.next(true);
      this.GetStore();

    });
    setHeightWidth();

    var date = new Date();

    this.startdate = moment().format('YYYY-MM-DD');
    this.enddate = moment().format('YYYY-MM-DD');
    console.log(this.startdate)
    this.Getreport();
  }

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
      this.stores.unshift(obj);
      var response: any = data;

      if (response.status == 0) {
        this.status = 0;
        this.errorMsg = response.msg;
        console.log(dangertoast(this.errorMsg));
      }
      this.Auth.isloading.next(false);
    });
  }

  selectEvent(e: { Id: any }) {
    this.storeId = e.Id;
    this.StoreId = this.storeId
    console.log(this.storeId)
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


  Getreport(){
    console.log(this.CompanyId, this.StoreId, this.startdate, this.enddate)
    console.log(this.startdate)
    this.Auth.GetKb2QtyRatio(this.CompanyId, this.StoreId, this.startdate, this.enddate).subscribe((data: any) => {
      this.orders = data['Report'];
      console.log(this.orders)
    })
  }

}
