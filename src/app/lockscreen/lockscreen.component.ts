import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-lockscreen',
  templateUrl: './lockscreen.component.html',
  styleUrls: ['./lockscreen.component.css'],
})
export class LockscreenComponent implements OnInit {
  companyid: number = 0;
  pin: string = '';
  errorMsg: string = '';
  constructor(
    private auth: AuthService,
    public router: Router,
    private jwtHelper: JwtHelperService
  ) {
    this.companyid = +JSON.parse(localStorage.getItem('company') || '{}')
      .CompanyId;
    this.pin = '';
  }

  ngOnInit(): void {}

  unlock() {
    this.auth.isloading.next(true);
    this.auth.unlock(this.pin, this.companyid).subscribe((data: any) => {
      this.auth.isloading.next(false);
      if (data['status'] == 200) {
        const token_parsed = this.jwtHelper.decodeToken(data['token']);
        localStorage.setItem('utoken', data['token']);
        localStorage.setItem('user', JSON.stringify(token_parsed));
        this.auth.user.next(token_parsed);
        this.auth.accLocked.next(false);
        this.auth
          .getusercompanies(token_parsed.userid)
          .subscribe((data: any) => {
            this.auth.companies.next(data['userCompanies']);
            this.auth.companyid.next(data['userCompanies'][0].CompanyId);
          });
      } else {
        this.errorMsg = 'INALID PIN!';
      }
    });
  }

  logout() {
    localStorage.removeItem('ctoken');
    localStorage.removeItem('utoken');
    this.auth.accLocked.next(true);
    this.auth.loggedIn.next(false);
    // this.modalService.dismissAll();
  }
}
