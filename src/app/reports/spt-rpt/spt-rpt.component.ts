import { Component, OnInit } from '@angular/core';
import { Observable, OperatorFunction } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { dangertoast } from 'src/assets/dist/js/toast-data';
import { dtrangepicker } from '../../../assets/dist/js/datePickerHelper';
import * as moment from 'moment';

declare function setHeightWidth(): any;
declare var $: any;

@Component({
  selector: 'app-spt-rpt',
  templateUrl: './spt-rpt.component.html',
  styleUrls: ['./spt-rpt.component.css'],
})
export class SptRptComponent implements OnInit {
  data: any;
  constructor(private Auth: AuthService) {}

  ngOnInit(): void {
    this.Auth.companyid.subscribe((companyid) => {
      this.CompanyId = companyid;
      this.Auth.isloading.next(true);
      this.GetStore();
    });

    setHeightWidth();
    this.Auth.companies.subscribe((comps) => {
      this.companies = comps;
    });

    this.setDateRange();
  }

  searchTerm: string = '';
  stores: any;
  storeId: any = 0;
  CompanyId: number = 0;
  companies: any = [];
  status!: number;
  errorMsg: string = '';
  todate: string = '';
  fromdate: string = '';

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

  selectEvent(e: { Id: any }) {
    this.storeId = e.Id;
  }

  selecteds(e: any) {
    this.storeId = e.Id;
    this.GetPaymentType();
  }

  GetStore() {
    this.Auth.GetStores(this.CompanyId).subscribe((data: any) => {
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
      var response: any = data;
      if (response.status == 0) {
        this.status = 0;
        this.errorMsg = response.msg;
        console.log(dangertoast(this.errorMsg));
      }
      this.Auth.isloading.next(false);
    });
  }

  setDateRange() {
    dtrangepicker('myrangepicker', (start: any, end: any) => {
      // this.fromdate = start.startOf('day').format('YYYY-MM-DD HH:mm:ss');
      // this.todate = end.endOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.fromdate = start.startOf('day').format('YYYY-MM-DD');
      this.todate = end.endOf('day').format('YYYY-MM-DD');
      (document.getElementById('typeahead-template') as HTMLElement).focus();
      console.log(this.fromdate, this.todate);
    })(moment(), moment());
  }

  PaymentType: any;
  GetPaymentType() {
    this.Auth.getpaymenttypes(this.CompanyId, this.storeId).subscribe(
      (data: any) => {
        this.PaymentType = data;
        console.log(data);
      }
    );
  }

  OrderDetails: any;
  CustomerDetails: any;
  openModal(data: any) {
    $('#myModal').modal('show');

    this.OrderDetails = data;

    this.Auth.GetCusDeltbyId(this.OrderDetails.cui).subscribe((data: any) => {
      this.CustomerDetails = data['cus'][0];
      console.log(data['cus'][0]);
    });
  }

  closeModal() {
    $('#myModal').modal('hide');
    this.CustomerDetails = [];
  }

  Selectspt: any = 0;
  ReportValues: any;
  // Report() {
  //   this.Auth.SPT_RPT(
  //     this.storeId,
  //     this.CompanyId,
  //     this.fromdate,
  //     this.todate,
  //     this.Selectspt
  //   ).subscribe((data: any) => {
  //     this.ReportValues = data['spt'];
  //     console.log(data);
  //   });
  // }

  selectedPaymentTypes: string[] = [];
  showFilterDropdown = false;
  uniquePaymentTypes: string[] = [];

  toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  selectedPaymentType: string = '';

  togglePaymentType(paymentType: string) {
    if (this.selectedPaymentType === paymentType) {
      this.selectedPaymentType = '';
    } else {
      this.selectedPaymentType = paymentType;
      this.filterlists = this.ReportValues.filter(
        (x: any) => x.PaymentType == this.selectedPaymentType
      );
      this.toggleFilterDropdown();
    }
  }

  filterlists: any;
  Report() {
    this.Auth.SPT_RPT(
      this.storeId,
      this.CompanyId,
      this.fromdate,
      this.todate,
      this.Selectspt
    ).subscribe((data: any) => {
      this.ReportValues = data['spt'];
      this.filterlists = this.ReportValues;
      this.uniquePaymentTypes = Array.from(
        new Set(this.ReportValues.map((item: any) => item.PaymentType))
      );
    });
  }

  closeDropdown() {
    this.showFilterDropdown = false;
  }

  revert() {
    this.filterlists = this.ReportValues;
    this.toggleFilterDropdown();
    this.selectedPaymentType = '';
  }
  //Hide Content
  hidecontent: boolean = true;
  keycode: string = 'sorrymaintenanceare';
  keyarr: Array<string> = [];
  unlockpagr(key: string) {
    this.keyarr = [...this.keyarr, key];
    if (this.keyarr.length == 3) {
      this.hidecontent = !(this.keyarr.join('') == this.keycode);
      if (!this.hidecontent) {
        //this.initial();
      }
      this.keyarr = [];
    }
  }
}
