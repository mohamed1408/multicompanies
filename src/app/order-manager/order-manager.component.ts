import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Ng2SearchPipe } from 'ng2-search-filter';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import * as moment from 'moment'

declare function setHeightWidth(): any;

@Component({
  selector: 'app-order-manager',
  templateUrl: './order-manager.component.html',
  styleUrls: ['./order-manager.component.css']
})
export class OrderManagerComponent implements OnInit {
  tabid: number = 0;
  storeid: number = 0
  companyid: number = 0;

  term: string = ""
  searchTerm: string = ""

  hidecontent: boolean = false;

  stores: any[] = []
  orders: any[] = []
  ordertypes: { id: number, title: string }[] = []
  tablist: string[] = ["Pending Orders", "Cancell"]

  moment: any = moment

  constructor(private auth: AuthService, private ng2filterpipe: Ng2SearchPipe) { }

  ngOnInit(): void {
    setHeightWidth()
    if(!this.hidecontent) {
      this.initial()
    }
  }

  initial() {
    this.hidecontent = false
    this.auth.companyid.subscribe((companyid) => {
      console.log(companyid)
      this.companyid = companyid;
      this.auth.isloading.next(true);
      this.getStores();
      this.auth.companies;
    });
    this.auth.companies.subscribe((comps) => {
      if (comps.findIndex((x) => x.CompanyId == 0) == -1)
        this.auth.companies.next([
          {
            AccountId: 0,
            AccountName: 'All',
            Address: '',
            CompanyId: 0,
            CompanyName: '',
            Email: '',
            UserId: 0,
          },
          ...comps,
        ]);
    });
  }

  getStores() {
    this.auth.GetStores(this.companyid).subscribe((data: any) => {
      this.storeid = 0
      this.stores = [{ Id: 0, Name: 'All' }, ...data];
      this.auth.isloading.next(false);
    });
  }
  formatter = (result: any) => result.Name;

  search: OperatorFunction<string, readonly string[]> = (
    text$: Observable<string>
  ) =>
    text$.pipe(
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
  selected(e: any) {
    this.storeid = e.Id;
  }

  getorderreport() {
    this.auth.getpendingorders(this.storeid, this.companyid).subscribe((data: any) => {
      console.log(data)
      this.orders = data["PendingOrders"].filter((x: any) => x.OrderJson).map((x: any) => JSON.parse(x.OrderJson))
    })
  }
  selectOrder(OdrsId: any, event: any) {

  }
  clearselection() {

  }
}
