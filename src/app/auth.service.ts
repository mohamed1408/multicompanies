import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseurl = 'https://biz1pos.azurewebsites.net/api/';

  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  public accLocked: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    true
  );

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  constructor(private router: Router, private http: HttpClient) {}

  toFormData(formValue: any) {
    const formData = new FormData();

    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      // console.log(key, value)
      formData.append(key, value);
    }
    return formData;
  }

  logIn(formdata: any) {
    let body = this.toFormData(formdata);
    return this.http.post(this.baseurl + 'LogIn/WebLogIn', body);
  }

  unlock(pin: string, companyid: number) {
    return this.http.get(
      this.baseurl + `LogIn/pinlogin?companyid=${companyid}&pin=${pin}`
    );
  }

  // logIn() {
  //   this.loggedIn.next(true);
  //   this.router.navigate(['/home']);
  // }

  // logout() {
  //   this.loggedIn.next(false);
  //   this.router.navigate(['/']);
  // }

  userstores(userid: number) {
    return this.http.get(
      this.baseurl + `Dashboard/UserStores?userid=${userid}`
    );
  }

  dashboarddata(
    fromdate: string,
    todate: string,
    storeid: number,
    userid: number,
    companyid: number
  ) {
    return this.http.get(
      this.baseurl +
        `Dashboard/Dashboards?fromdate=${fromdate}&todate=${todate}&storeid=${storeid}&userid=${userid}&companyid=${companyid}`
    );
  }

  getusercompanies(userid: number) {
    return this.http.get(
      this.baseurl + `Dashboard/GetUserCompanies?userid=${userid}`
    );
  }

  GetStores(CompanyId: number) {
    var formURL = this.baseurl + 'Stores/Get?CompanyId=' + CompanyId;
    return this.http.get(formURL);
  }

  getdashboardbycompany(
    fromdate: string,
    totdate: string,
    companyid: number,
    storeid: number
  ) {
    return this.http.get(
      this.baseurl +
        `Dashboard/Post?fromDate=${fromdate}&toDate=${totdate}&compId=${companyid}&storeId=${storeid}`
    );
  }

  GetStorewiseRpt(frmdate: string, todate: string, compId: number) {
    return this.http.get(
      this.baseurl +
        'StoreRpt/GetStoreRpt?frmdate=' +
        frmdate +
        '&todate=' +
        todate +
        '&companyId=' +
        compId
    );
  }
}
