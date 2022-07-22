import { Component, HostListener, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  user: any;
  companies: any = [];
  companyid: number = 0;
  showdropdown: Observable<boolean>;
  selected_companies: string = '';
  all: boolean = false;

  constructor(private Auth: AuthService) {
    this.showdropdown = Auth.showdropdown;
  }

  ngOnInit(): void {
    setHeightWidth();
    this.Auth.companies.subscribe((comps) => {
      this.companies = comps;
    });
  }

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

  select(i: number) {
    console.log(i);
  }

  toggleDropDown() {
    this.Auth.showdropdown.next(true);
  }

  change(bool: boolean = true) {
    // console.log(bool);
    this.selected_companies = this.companies
      .filter((x: any) => x.isselected)
      .map((x: any) => x.AccountName)
      .join(', ');
    console.log(this.selected_companies);
  }

  toggleAll() {
    this.companies.forEach((element: any) => {
      element.isselected = this.all;
    });
    this.change();
  }
}
