import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'StoreSales';
  isCollapsed: boolean = false;
  isLoggedIn$: Observable<boolean>;

  constructor(
    private auth: AuthService,
    public router: Router,
    private jwtHelper: JwtHelperService
  ) {
    setHeightWidth();
    console.log(this.router.url);
    this.isLoggedIn$ = this.auth.isLoggedIn;
    const ctoken = localStorage.getItem('ctoken') || '';
    const utoken = localStorage.getItem('utoken') || '';
    if (ctoken != '') {
      this.auth.loggedIn.next(true);
    }
    this.isLoggedIn$.subscribe((data) => {
      console.log(data);
      if (!data) {
        this.router.navigate(['/']);
      } else {
        if (utoken != '' && !this.jwtHelper.isTokenExpired(utoken)) {
          this.router.navigate(['/storewisereport']);
        } else {
          this.router.navigate(['/lock']);
        }
      }
    });
  }
}
