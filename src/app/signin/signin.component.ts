import { Component, OnInit } from '@angular/core';
import { OwlCarousel } from '../../assets/dist/js/login-data'
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  EmailId: string = ""
  Password: string = ""
  showpassword: string = "password"

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    OwlCarousel("login_owl_carousel")
  }

  login() {
    this.auth.logIn({ EmailId: this.EmailId, Password: this.Password }).subscribe((data: any) => {
      console.log(data)
      localStorage.setItem("ctoken", data.token.Value.token.Value)
      if (data["status"] == 200) {
        this.auth.loggedIn.next(true)
      }
    })
  }

  togglepasswordvisibility() {
    this.showpassword = (this.showpassword == "password") ? "text" : "password"
  }
}
