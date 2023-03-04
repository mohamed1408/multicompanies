import { Component, OnInit } from '@angular/core';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import * as moment from 'moment';

import { daterangepicker } from '../../assets/dist/js/datePickerHelper';

@Component({
  selector: 'app-productsalesreport',
  templateUrl: './productsalesreport.component.html',
  styleUrls: ['./productsalesreport.component.css'],
})
export class ProductsalesreportComponent implements OnInit {
  enddate: string = '';
  startdate: string = '';
  searchTerm: string = '';

  stores: any = [];
  categories: any[] = [];
  products: any[] = [];

  storeid: number = 0;
  companyid: number = 0;
  ordertypid: number = 3;
  categoryid: number = 0;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.companyid.subscribe((companyid) => {
      this.companyid = companyid;
      this.auth.isloading.next(true);
      this.getstore();
      this.getCategory();
    });

    daterangepicker('myrangepicker', (start: any, end: any) => {
      console.log(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
      this.startdate = start.format('YYYY-MM-DD');
      this.enddate = end.format('YYYY-MM-DD');
      // this.storeRpt();
    })(moment(), moment());
  }

  getstore() {
    this.auth.GetStores(this.companyid).subscribe((data: any) => {
      this.stores = data;
      console.log(this.stores);
      var obj = {
        Id: 0,
        Name: 'All',
        ParentStoreId: null,
        ParentStore: null,
        IsMainStore: false,
      };
      this.stores.unshift(obj);
      var response: any = data;
      // this.All();

      if (response.status == 0) {
        // this.status = 0;
        // this.errorMsg = response.msg;
        // console.log(dangertoast(this.errorMsg));
      }
      this.auth.isloading.next(false);
    });
  }
  getCategory() {
    this.auth.getcat(this.companyid).subscribe((data: any) => {
      this.categories = data;
    });
  }

  formatter = (result: any) => result.Name;
  search: OperatorFunction<string, readonly string[]> = (
    text$: Observable<string>
  ) =>
    text$.pipe(
      // debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : this.stores
              .filter(
                (v: any) =>
                  v.Name.toLowerCase().indexOf(term.toLowerCase()) > -1
              )
              .slice(0, 10)
      )
    );

  selected = (a: any) => {
    console.log(a);
    this.storeid = a.Id;
  };

  submit() {
    this.auth
      .productsales(
        this.companyid,
        this.storeid,
        this.startdate,
        this.enddate,
        this.categoryid,
        this.ordertypid
      )
      .subscribe((data: any) => {
        // console.log(data);
        let products = data.report.map((element: any) => {
          let raw = JSON.parse(element.OrderJson)
            .KOTS.filter((x: any) => x.refid == element.kotrefid)[0]
            .Items.filter((x: any) => x.refid == element.refid)[0];
          console.log(raw.ProductKey, raw.Quantity);
          return {
            ...raw,
            BillAmount: element.BillAmount,
            InvoiceNo: element.InvoiceNo,
            OrderedDateTime: element.OrderedDateTime,
          };
        });
        console.log(products);
        products.forEach((product: any) => {
          if (this.products.some((x) => x.ProductKey == product.ProductKey)) {
            this.products = this.products.map((y: any) => {
              if (y.ProductKey == product.ProductKey) {
                y.Quantity += product.Quantity;
                y.ComplementryQty += product.ComplementryQty;
                y.TotalAmount += (product.TotalAmount * (product.Quantity/Math.abs(product.Quantity)))
              }
              return y;
            });
          } else {
            this.products.push(product);
          }
        });
        console.log(this.products);
      });
  }
}
