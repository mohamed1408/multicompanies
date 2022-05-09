import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { daterangepicker } from '../../assets/dist/js/datePickerHelper';
import * as moment from 'moment';
import { Ng2SearchPipe } from 'ng2-search-filter';

declare function setHeightWidth(): any;
declare const $wrapper: any;

@Component({
  selector: 'app-storewise',
  templateUrl: './storewise.component.html',
  styleUrls: ['./storewise.component.css'],
  providers: [Ng2SearchPipe],
})
export class StorewiseComponent implements OnInit {
  stores: any = [];
  user: any;
  companies: any = [];
  companyid: number = 0;
  storeid: number = 0;
  startdate: string = '';
  enddate: string = '';
  storereport: any = [];
  term: string = '';
  TotalBill: number = 0;
  TotalPaidAmt: number = 0;
  Tax: number = 0;
  TotalDisc: number = 0;
  TotalPOS: number = 0;
  TotalSWIGGY: number = 0;
  TotalZomato: number = 0;
  rangeSetting: RangeSetting | null = null;
  rangeSettings: Array<RangeSetting> = [];
  sortSetting: any = {
    PaidAmount: ['PaidAmount', 0],
    BillAmount: ['BillAmount', 0],
  };
  constructor(private Auth: AuthService, private ng2filterpipe: Ng2SearchPipe) {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.rangeSettings = JSON.parse(
      localStorage.getItem('rangeSettings') || '[]'
    );
  }

  ngOnInit(): void {
    this.Auth.isloading.next(false);
    setHeightWidth();
    // this.stores = [...Array(50)].map((x) => 0);
    this.getusercompany();
    this.navbartoggle();
  }

  getusercompany() {
    this.Auth.isloading.next(true);
    this.Auth.getusercompanies(this.user.userid).subscribe((data: any) => {
      this.companies = data['userCompanies'];
      this.companyid = this.companies[0].CompanyId;
      this.storeid = 0;
      this.getstores();
      daterangepicker('myrangepicker', (start: any, end: any) => {
        console.log(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
        this.startdate = start.format('YYYY-MM-DD');
        this.enddate = end.format('YYYY-MM-DD');
        // this.storeRpt();
      })(moment(), moment());
    });
  }

  getstores() {
    this.Auth.GetStores(this.companyid).subscribe((data) => {
      console.log(data);
      this.stores = data;
      this.Auth.isloading.next(false);
    });
  }

  storeRpt() {
    this.Auth.isloading.next(true);
    this.Auth.GetStorewiseRpt(
      this.startdate,
      this.enddate,
      this.companyid
    ).subscribe((data: any) => {
      console.log(data);
      this.storereport = data['Order'];
      this.calculate();
      this.paint();
      this.Auth.isloading.next(false);
    });
  }

  calculate() {
    this.TotalBill = 0;
    this.TotalPaidAmt = 0;
    this.Tax = 0;
    this.TotalDisc = 0;
    this.TotalPOS = 0;
    this.TotalSWIGGY = 0;
    this.TotalZomato = 0;
    this.ng2filterpipe
      .transform(this.storereport, this.term)
      .forEach((rpt: any) => {
        this.TotalBill += rpt.BillAmount;
        this.TotalPaidAmt += rpt.PaidAmount;
        this.Tax += rpt.Tax;
        this.TotalDisc += rpt.DiscAmount;
        this.TotalPOS += rpt.Pos;
        this.TotalSWIGGY += rpt.Swiggy;
        this.TotalZomato += rpt.Zomato;
        rpt.PosPaid = +(rpt.PaidAmount - rpt.Swiggy - rpt.Zomato).toFixed(0);
      });
    this.TotalBill = +this.TotalBill.toFixed(0);
    this.TotalPaidAmt = +this.TotalPaidAmt.toFixed(0);
    this.Tax = +this.Tax.toFixed(0);
    this.TotalDisc = +this.TotalDisc.toFixed(0);
    this.TotalPOS = +this.TotalPOS.toFixed(0);
    this.TotalSWIGGY = +this.TotalSWIGGY.toFixed(0);
    this.TotalZomato = +this.TotalZomato.toFixed(0);
  }

  getdashboard() {
    this.Auth.getdashboardbycompany(
      this.startdate,
      this.enddate,
      this.companyid,
      this.storeid
    ).subscribe((data: any) => {
      console.log(data);
      this.storereport = data['TotalSales'];
    });
  }

  openDrawer() {
    $wrapper.toggleClass('hk-settings-toggle');
  }

  navbartoggle() {
    // console.log(document.getElementById("maindiv"))
    document.getElementById('maindiv')?.classList.add('hk-nav-toggle');
  }

  newSetting() {
    this.rangeSetting = new RangeSetting();
  }

  addSetting() {
    if (this.rangeSetting != null) this.rangeSettings.push(this.rangeSetting);
    localStorage.setItem('rangeSettings', JSON.stringify(this.rangeSettings));
    this.rangeSetting = null;
    this.paint();
  }

  updateSettings() {
    this.rangeSettings.forEach((set) => (set.editmode = false));
    localStorage.setItem('rangeSettings', JSON.stringify(this.rangeSettings));
    this.paint();
  }

  deleteSetting(i: number) {
    this.rangeSettings.splice(i, 1);
    localStorage.setItem('rangeSettings', JSON.stringify(this.rangeSettings));
    this.paint();
  }

  paint() {
    this.storereport.forEach((rpt: any) => {
      if (
        this.rangeSettings.some(
          (x) => x.from <= rpt.PaidAmount && x.to >= rpt.PaidAmount
        )
      ) {
        rpt.setting = this.rangeSettings.filter(
          (x) => x.from <= rpt.PaidAmount && x.to >= rpt.PaidAmount
        )[0];
      } else {
        rpt.setting = new RangeSetting();
      }
    });
  }

  sort(field: string) {
    const { compare } = Intl.Collator('en-US');
    if ([-1, 0].includes(this.sortSetting[field][0])) {
      this.sortSetting[field][0] = 1;
    } else {
      this.sortSetting[field][0] = -1;
    }
    this.storereport = this.storereport.sort(
      (a: any, b: any) =>
        ((a[field] - b[field]) / Math.abs(a[field] - b[field])) *
        this.sortSetting[field][0]
    );
  }
}

class RangeSetting {
  color: string;
  from: number;
  to: number;
  editmode: boolean;

  constructor() {
    this.color = 'white';
    this.from = 0;
    this.to = 0;
    this.editmode = false;
  }
}
