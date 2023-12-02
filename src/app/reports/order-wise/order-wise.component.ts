import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Ng2SearchPipe } from 'ng2-search-filter';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import * as moment from 'moment';
import { daterangepicker } from '../../../assets/dist/js/datePickerHelper';
declare function setHeightWidth(): any;

@Component({
  selector: 'app-order-wise',
  templateUrl: './order-wise.component.html',
  styleUrls: ['./order-wise.component.css'],
  providers: [Ng2SearchPipe]
})
export class OrderWiseComponent implements OnInit {

  storeid: number = 0
  sourceid: number = 0
  companyid: number = 0;

  totalba: number = 0
  totalpa: number = 0

  term: string = ""
  todate: string = ""
  fromdate: string = ""
  searchTerm: string = ""

  report: any[] = []
  stores: any[] = []

  products: oprep

  constructor(private auth: AuthService, private ng2filterpipe: Ng2SearchPipe) {
    this.products = new oprep([])
  }

  ngOnInit(): void {
    setHeightWidth()
    this.initial()
  }
  initial() {
    this.getProducts()
    this.auth.companyid.subscribe((companyid) => {
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
    this.setDateRange()
  }
  getStores() {
    this.auth.GetStores(this.companyid).subscribe((data: any) => {
      this.storeid = 0
      this.stores = [{ Id: 0, Name: 'All' }, ...data];
      this.auth.isloading.next(false);
    });
  }
  getProducts() {
    this.auth.getAllOld().subscribe((data: any) => {
      this.products = new oprep(data)
    })
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
  setDateRange() {
    daterangepicker('myrangepicker', (start: any, end: any) => {
      this.fromdate = start.startOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.todate = end.endOf('day').format('YYYY-MM-DD HH:mm:ss');
      (document.getElementById("typeahead-template") as HTMLElement).focus()
      console.log(this.fromdate, this.todate);
    })(moment(), moment());
  }

  selected(e: any) {
    this.storeid = e.Id;
  }

  itemagg(items: any[]) {
    // console.log(items)
    let ci: any[] = []
    items.forEach(it => {
      let pk = it.r ? it.r.split(":").pop() : it.ProductKey
      if (ci.some(x => x.pk == pk)) {
        ci.filter(x => x.pk == pk)[0].qa(it.qy)
      } else {
        let c: any = { pd: this.products.f(it.pi || it.ProductId)?.Name, t: (it.t1 || it.Tax1) + (it.t2 || it.Tax2), pr: it.p || it.Price, qy: it.qt || it.Quantity, ta: 0 }
        c.cta = () => { c.ta = c.qy * c.pr }
        c.qa = (q: number) => { c.qy += q; c.cta() }
        c.cta()
        ci.push(c)
      }
    })
    return ci
  }
  Report: any[] = []
  getorderreport() {
    this.auth.orderwiseV2(this.fromdate, this.todate, this.storeid, this.companyid, this.sourceid).subscribe((data: any) => {
      let report: any[] = data["report"]
      this.totalba = 0
      this.totalpa = 0
      this.report = []
      report.forEach(r => {
        if (this.report.some(x => x.OdrsId == r.OdrsId)) {
          this.report.filter(x => x.OdrsId == r.OdrsId)[0].addkot(r.json)
        } else {
          r.kots = []
          r.oddt = moment(r.oddt).format('MMM d, YYYY HH:mm A')
          r.addkot = (json: string) => {
            r.kots.push(JSON.parse(json))
            r.items = this.itemagg(r.kots.map((x: any) => x.its || x.Items).flat())
          }
          r.addkot(r.json)
          r.itemlist = r.items.map((x: any) => x.pd + ` [${x.qy}]`).join(", ")
          delete r.json
          this.report.push(r)
          this.totalba += r.ba
          this.totalpa += r.pa
        }
      })
      console.log(this.report)
      this.Report = this.report
    })
  }
  filter() {
    this.totalba = 0
    this.totalpa = 0
    this.ng2filterpipe.transform(this.Report, this.term).forEach((x: any) => {
      this.totalba += x.ba
      this.totalpa += x.pa
    })
  }
  selectedOrder: any
  selectOrder(odrsid: number) {
    this.selectedOrder = this.report.filter((x: any) => x.OdrsId == odrsid)[0]
    console.log(this.selectedOrder)
  }
  hidecontent: boolean = true;
  keycode: string = 'sorrymaintenanceare';
  keyarr: Array<string> = [];
  unlockpagr(key: string) {
    this.keyarr = [...this.keyarr, key];
    if (this.keyarr.length == 3) {
      this.hidecontent = !(this.keyarr.join('') == this.keycode);
      if (!this.hidecontent) {
        this.initial()
      }
      this.keyarr = []
    }
  }
}
interface op {
  CategoryId: number
  Id: number
  Name: string
  OldId: number
  Price: number
  TaxGroupId: number
  groupid: number
}
class oprep {
  products: op[]
  constructor(prods: any[]) {
    this.products = prods
  }
  f(id: number) {
    return this.products.filter(x => x.OldId == id)[0]
  }
}