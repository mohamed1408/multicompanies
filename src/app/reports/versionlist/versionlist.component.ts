import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import * as moment from 'moment';
import { data } from 'jquery';
import { elementAt } from 'rxjs/operators';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-versionlist',
  templateUrl: './versionlist.component.html',
  styleUrls: ['./versionlist.component.css']
})
export class VersionlistComponent implements OnInit {

  CompanyId: number = 0;
  StoreId: number;
  startdate = moment().format('YYYY-MMM-DD')
  enddate: any;
  selected: any;
  OrderTypeId = 0;
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
  constructor(private Auth: AuthService ) {
    this.Auth.limited_user.subscribe((lu) => {
      this.limited_user = lu;
    });
    this.StoreId = 0;
  }

  ngOnInit(): void {
    this.Auth.companyid.subscribe((companyid) => {
      this.CompanyId = companyid;
      this.Submit();

      // this.Auth.isloading.next(true);
      // this.GetStore();
      // this.GetCustomerList();
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
  apkversion : any
  Submit() {
    this.Auth.isloading.next(true);
    this.Auth.getAppVersion(this.CompanyId, moment(this.startdate).format('YYYY-MM-DD')).subscribe((data : any) =>{
      console.log(data)
      this.apkversion = data.versions
      console.log(this.apkversion)
      this.Auth.isloading.next(false);
    })
  }
}
