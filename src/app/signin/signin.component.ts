import { Component, OnInit } from '@angular/core';
import { OwlCarousel } from '../../assets/dist/js/login-data';
import { AuthService } from '../auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent implements OnInit {
  EmailId: string = '';
  Password: string = '';
  showpassword: string = 'password';

  constructor(
    private auth: AuthService,
    public router: Router,
    private jwtHelper: JwtHelperService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    OwlCarousel('login_owl_carousel');
  }

  showAlert = false;
  login() {
    this.auth
      .logIn({ EmailId: this.EmailId, Password: this.Password })
      .subscribe((data: any) => {
        console.log(data);
        this.alertService(data);
        const token_parsed = this.jwtHelper.decodeToken(
          data.token.Value.token.Value
        );
        localStorage.setItem('ctoken', data.token.Value.token.Value);
        localStorage.setItem(
          'company',
          JSON.stringify({ ...token_parsed, CompanyId: data.company.Id })
        );
        if (data['status'] == 200) {
          this.auth.loggedIn.next(true);
          this.auth.companyid.next(data.company.Id);
          this.router.navigate(['/lock']);
        }
      });
  }

  togglepasswordvisibility() {
    this.showpassword = this.showpassword === 'password' ? 'text' : 'password';
  }

  alertService(data: any) {
    if (data['status'] == 200) {
      this.showSuccessAlert();
    } else if (data['status'] == 0) {
      this.showDangerAlert();
    }
  }

  successAlert = false;
  dangerAlert = false;
  successMessage = 'Successfully LogIn, Enter a Pin';
  dangerMessage = 'Failed!, Incorrect Email or Password';
  showSuccessAlert() {
    this.successAlert = true;
    setTimeout(() => {
      this.successAlert = false;
    }, 3000);
  }

  showDangerAlert() {
    this.dangerAlert = true;
    setTimeout(() => {
      this.dangerAlert = false;
    }, 3000);
  }
}
