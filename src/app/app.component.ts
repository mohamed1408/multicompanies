import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SignalrService } from './services/signalr/signalr.service';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @HostListener('click', ['$event.target'])
  onClick(btn: any) {
    // console.log('button', btn, btn.classList.value);
    if (!btn.classList.value.includes('cbselectels')) {
      this.auth.showdropdown.next(false);
    }
    if (
      btn.classList.value.includes('sourcemultiselect') ||
      btn.classList.value.includes('storemultiselect')
    ) {
      let sdd: any = document.getElementById('sourcemultiselectdd');
      let sTdd: any = document.getElementById('storemultiselectdd');

      if (btn.classList.value.includes('sourcemultiselect')) {
        sdd.hidden = false;
      } else if (sdd) {
        sdd.hidden = true;
      }

      if (btn.classList.value.includes('storemultiselect')) {
        sTdd.hidden = false;
      } else if (sTdd) {
        sTdd.hidden = true;
      }
    } else {
      for (
        let i = 0;
        i < document.getElementsByClassName('multidd').length;
        i++
      ) {
        let a = (document
          .getElementsByClassName('multidd')
          .item(i) as HTMLElement) || { hidden: false }; //.hidden = true
        a.hidden = true;
      }
    }
  }

  title = 'StoreSales';
  isCollapsed: boolean = false;
  isLoggedIn$: Observable<boolean>;
  isLocked$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  companyid: number;
  user: any;
  savedcompany: any;
  SavedRoleZone: any;
  savedcompanyFinal: any;
  constructor(
    private auth: AuthService,
    public router: Router,
    private jwtHelper: JwtHelperService,
    private signalR: SignalrService
  ) {
    setHeightWidth();
    console.log(this.router.url);
    this.isLoggedIn$ = this.auth.isLoggedIn;
    this.isLocked$ = this.auth.accLocked;
    this.isLoading$ = this.auth.isloading;

    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.SavedRoleZone = this.user.roleid;
    //HYPER CHANGING SAVE TOP COMPANY IN LOCAL STOARGE
    this.savedcompany = localStorage.getItem('SavedCompaniesId');
    this.savedcompanyFinal = parseInt(this.savedcompany);

    this.companyid = +JSON.parse(localStorage.getItem('company') || '{}')
      .CompanyId;

    this.auth.companyid.subscribe((cid) => {
      console.log(cid);
    });

    this.savedcompany = localStorage.getItem('SavedCompaniesId');

    if (Number.isNaN(this.savedcompanyFinal) == false) {
      this.companyid = this.savedcompanyFinal;
    }
    const ctoken = localStorage.getItem('ctoken') || '';
    const utoken = localStorage.getItem('utoken') || '';
    if (ctoken != '') {
      this.auth.loggedIn.next(true);
    }
    if (!(utoken == '' || this.jwtHelper.isTokenExpired(utoken))) {
      const token_parsed = this.jwtHelper.decodeToken(utoken);
      localStorage.setItem('utoken', utoken);
      localStorage.setItem('user', JSON.stringify(token_parsed));
      this.auth.user.next(token_parsed);
      this.auth.accLocked.next(false);
      this.auth.getusercompanies(token_parsed.userid).subscribe((data: any) => {
        if (this.SavedRoleZone == 1) {
          this.auth.companies.next([
            {
              AccountId: 0,
              AccountName: 'All',
              Address: '',
              CompanyId: 0,
              CompanyName: 'All Companies',
              Email: 'all@gmail.com',
              UserId: 149,
            },
            ...data['userCompanies'],
          ]);
          this.auth.companyid.next(this.companyid);
        } else {
          this.auth.companies.next([
            // {
            //   AccountId: 0,
            //   AccountName: 'All',
            //   Address: '',
            //   CompanyId: 0,
            //   CompanyName: 'All Companies',
            //   Email: 'all@gmail.com',
            //   UserId: 149,
            // },
            ...data['userCompanies'],
          ]);
          this.auth.companyid.next(this.companyid);
        }
      });
    } else {
      this.auth.accLocked.next(true);
    }
    this.isLoggedIn$.subscribe((data) => {
      console.log(data);
      if (!data) {
        this.router.navigate(['/']);
      } else {
        this.isLocked$.subscribe((bool) => {
          // if (data) {
          if (!bool) {
            console.log(this.router.url);
            // this.router.navigate(['/maintenance']);
          } else {
            this.router.navigate(['/lock']);
          }
          // } else {
          //   this.router.navigate(['/']);
          // }
        });
        // if (utoken != '' && !this.jwtHelper.isTokenExpired(utoken)) {
        //   this.router.navigate(['/storewisereport']);
        // } else {
        //   this.router.navigate(['/lock']);
        // }
      }
    });
    this.signalR.connect();
  }
}
