import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  user: any;
  companies: any = [];
  companyid: number = 0;

  constructor(private Auth: AuthService) {}

  ngOnInit(): void {}

  getusercompany() {
    this.Auth.getusercompanies(this.user.userid).subscribe((data: any) => {
      this.companies = data['userCompanies'];
      // this.companyid = this.companies[0].CompanyId;
    });
  }

  getcompanyproducts() {
    // this.Auth.getCompanyProducts(this.companyid).subscribe((data: any) => {
    //   console.log(data);
    // });
  }

  getcompanyspg() {
    // this.Auth.getCompanyProducts(this.companyid).subscribe((data: any) => {
    //   console.log(data);
    // });
  }
}
