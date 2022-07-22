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
    console.log('button', btn, btn.classList.value);
    if (!btn.classList.value.includes('cbselectels')) {
      this.auth.showdropdown.next(false);
    }
  }

  title = 'StoreSales';
  isCollapsed: boolean = false;
  isLoggedIn$: Observable<boolean>;
  isLocked$: Observable<boolean>;
  isLoading$: Observable<boolean>;

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
    this.auth.companyid.subscribe((cid) => {
      console.log(cid);
    });
    const ctoken = localStorage.getItem('ctoken') || '';
    const utoken = localStorage.getItem('utoken') || '';
    if (ctoken != '') {
      this.auth.loggedIn.next(true);
    }
    if (utoken == '' || this.jwtHelper.isTokenExpired(utoken)) {
      this.auth.accLocked.next(true);
    }
    this.isLoggedIn$.subscribe((data) => {
      console.log(data);
      if (!data) {
        this.router.navigate(['/']);
      } else {
        this.isLocked$.subscribe((bool) => {
          if (data) {
            if (!bool) {
              this.router.navigate(['/storewisereport']);
            } else {
              this.router.navigate(['/lock']);
            }
          } else {
            this.router.navigate(['/']);
          }
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
