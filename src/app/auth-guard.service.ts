import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  token: string = ""
  ctoken: string = ""
  user: any;
  constructor(public jwtHelper: JwtHelperService, public router: Router) {
    this.token = localStorage.getItem("utoken") || ""
    this.ctoken = localStorage.getItem("ctoken") || ""
  }
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.user = JSON.parse(localStorage.getItem("user") || '{"role": ""}')
    console.log(next.routeConfig?.path, this.jwtHelper.getTokenExpirationDate(this.token))
    if ((next.routeConfig?.path != '' && next.routeConfig?.path != 'lock') && !this.jwtHelper.getTokenExpirationDate(this.token)) {
      console.log("Expired!")
      this.router.navigate(['']);
      return false;
    } else if (!next.data.role.includes(this.user.role.toLowerCase()) && !next.data.role.includes("all")) {
      console.log(next.url, this.user.role, "No Role")
      this.router.navigate(['lock']);
      return false;
    }
    return true;
  }
}
