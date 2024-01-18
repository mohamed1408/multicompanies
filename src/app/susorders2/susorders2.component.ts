import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment';
import { Ng2SearchPipe } from 'ng2-search-filter';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { AuthService } from '../auth.service';
import { dtrangepicker, singleDateTime } from '../../assets/dist/js/datePickerHelper';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-susorders2',
  templateUrl: './susorders2.component.html',
  styleUrls: ['./susorders2.component.css']
})
export class Susorders2Component implements OnInit {
  @ViewChild('kotInfo', { static: false }) private kotInfo: ElementRef | any;
  @ViewChild('dckotInfo', { static: false }) private dckotInfo: ElementRef | any;

  term: string
  searchTerm: string
  fromdate: string
  todate: string

  tabid: number;
  storeid: number
  companyid: number;

  stores: any[];
  tablist: string[];
  selectedkots: any[];
  cancelleditems: any[];
  discountedorders: any[];

  selecteditem: any;

  constructor(private auth: AuthService, private modalService: NgbModal, private ng2FilterPipe: Ng2SearchPipe) {
    this.term = "";
    this.todate = ""
    this.fromdate = ""
    this.searchTerm = "";

    this.stores = [];
    this.selectedkots = []
    this.cancelleditems = []
    this.discountedorders = []
    this.tablist = ["Cancelled", "Discount"]

    this.tabid = 0
    this.storeid = 0;
    this.companyid = 0;

    this.selecteditem = { kots: [] }
  }

  ngOnInit(): void {
    this.auth.companyid.subscribe((companyid) => {
      this.companyid = companyid;
      this.auth.isloading.next(true);
      this.getStores();
    });
    this.setDateRange()
    setHeightWidth()
  }

  getStores() {
    this.auth.GetStores(this.companyid).subscribe((data: any) => {
      this.storeid = 0
      this.stores = [{ Id: 0, Name: 'All' }, ...data];
      this.auth.isloading.next(false);
    });
  }

  setDateRange() {
    dtrangepicker('myrangepicker', (start: any, end: any) => {
      this.fromdate = start.startOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.todate = end.endOf('day').format('YYYY-MM-DD HH:mm:ss');
      console.log(this.fromdate, this.todate);
    })(moment(), moment());
  }

  selected(e: any) {
    this.storeid = e.Id;
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

  getSusOrders() {
    this.auth.getSusOrders(this.companyid, this.storeid, this.fromdate, this.todate).subscribe(data => {
      console.log(data)
      this.formatdata(data)
    })
  }

  formatdata(data: any) {
    let cancelleditems: any[] = data["byCancelledItems"]
    let discountorders: any[] = data["byDiscount"]

    cancelleditems.forEach(i => {
      i.store = this.stores.filter(x => x.Id == i.StoreId)[0].Name
      i.kots = this.getkots(i.allitems)
      console.log(i.kots);
      [i.qtymap, i.totalqty, i.pricemap] = this.qtymap(i.kots, i.KOTId, i.pi)
      i.trend = i.kots.at(-1).totalsofar - i.kots.at(0).totalsofar
    })

    discountorders.forEach(di => {
      di.store = this.stores.filter(x => x.Id == di.si)[0].Name
    })

    this.cancelleditems = cancelleditems
    this.discountedorders = discountorders
    this.selecteditem = { kots: [] }
    console.log(cancelleditems)
  }

  getkots(jstring: string) {
    let json: any[] = JSON.parse(jstring)
    let kots: any[] = []
    json.forEach(i => {
      if (!kots.some(x => x.KOTId == i.KOTId)) {
        kots.push({
          KOTId: i.KOTId,
          CreatedDate: moment(i.CreatedDate).format("MMM D, hh:mm a"),
          KOTNo: i.KOTNo,
          items: [{ pi: i.pi, product: i.product, ta: i.ta, tax: i.tax, qy: i.qy, pr: i.pr, price: i.price }]
        })
      } else {
        kots.filter(x => x.KOTId == i.KOTId)[0].items.push({ pi: i.pi, product: i.product, ta: i.ta, tax: i.tax, qy: i.qy, pr: i.pr, price: i.price })
      }
    });
    return kots;
  }

  qtymap(kots: any[], kotid: number, pi: number) {
    let map: string = "from", lastqty: number = 0, pricemap: string = "", lastprc: number = 0
    kots.forEach(k => {
      lastprc += k.items.map((x: any) => x.pr * x.qy).reduce((a: number, c: number) => a + c, 0)
      k.totalsofar = lastprc
      // console.log(kotid, pi, k.totalsofar)
      pricemap += ` ${lastprc} ->`
      let item = k.items.filter((i: any) => i.pi == pi)[0]
      if (k.KOTId <= kotid && item) {
        lastqty += item.qy
        map += ` ${lastqty} to`
      }
    })
    console.log(kots.map(x => [kotid, x.KOTId, x.totalsofar]))
    return [map.replace(/.{3}$/i, ""), lastqty, pricemap.replace(/.{3}$/i, "")]
  }

  selectitem(item: any) {
    this.selecteditem = item
  }

  selectkots(kots: any[]) {
    this.selectedkots = kots
  }

  savereason(order: any) {
    order.loading = true
    this.auth.savereason(order.OrderId, order.icr, order.dr).subscribe(data => {
      console.log(data)
      order.loading = false
    })
  }
}
