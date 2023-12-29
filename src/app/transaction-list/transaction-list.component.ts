import * as moment from 'moment';
import { AuthService } from '../auth.service';
import { Ng2SearchPipe } from 'ng2-search-filter';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { daterangepicker } from '../../assets/dist/js/datePickerHelper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css'],
  providers: [Ng2SearchPipe],
})
export class TransactionListComponent implements OnInit {
  @ViewChild('selection', { static: false }) private selection: ElementRef | any;
  @ViewChild('compare_modal', { static: true }) private compare_modal!: ElementRef;

  searchTerm: string = ""
  stores: any[] = []
  storeid: number = 0
  companyid: number = 0;
  fromdate: string = ""
  todate: string = ""
  ptypes: any[] = []
  pos_report: { summary: any[], transactions: any[], showtransaxns: any[] } = { summary: [], transactions: [], showtransaxns: [] }

  constructor(private auth: AuthService, private modalService: NgbModal) { }

  ngOnInit(): void {
    setHeightWidth();
  }

  initial() {
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
    this.setDateRange();
  }
  getStores() {
    this.auth.GetStores(this.companyid).subscribe((data: any) => {
      this.storeid = 0
      this.stores = [{ Id: 0, Name: 'All' }, ...data];
      this.auth.isloading.next(false);
    });
  }
  getspt() {
    this.auth.getspt(this.storeid).subscribe((data: any) => {
      this.ptypes = data["paymenttypes"]
    })
  }
  getTransactionList() {
    this.auth.getstorepaymentsbytype(this.storeid, this.companyid, this.fromdate, this.todate).subscribe((data: any) => {
      this.selectedtransaxn = null;
      this.pos_report = { summary: data["pos_summary"], transactions: data["pos_transactions"], showtransaxns: data["pos_transactions"].filter((x: any) => x.StorePaymentTypeId == data["pos_summary"][0].StorePaymentTypeId) }
    })
  }
  setDateRange() {
    daterangepicker('myrangepicker', (start: any, end: any) => {
      this.fromdate = start.startOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.todate = end.endOf('day').format('YYYY-MM-DD HH:mm:ss');
      (document.getElementById("typeahead-template") as HTMLElement).focus()
      console.log(this.fromdate, this.todate);
    })(moment(), moment());
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
    this.getspt()
  }

  selectptype(i: number) {
    let selection = document.getElementById("selection") as HTMLElement
    console.log(selection)
    selection.style.transform = `translate3d(0px, ${48 * i}px, 0px)`
    this.pos_report.showtransaxns = this.pos_report.transactions.filter((x: any) => x.StorePaymentTypeId == this.pos_report.summary[i].StorePaymentTypeId)
  }
  selectedtransaxn: any
  editTransaction(i: number, event: MouseEvent) {
    this.selectedtransaxn = this.copyworef(this.pos_report.showtransaxns[i])
    console.log(this.selectedtransaxn)
    let popup = document.getElementById("ptype-pop") as HTMLElement
    let srcEl = event.target as HTMLElement
    popup.style.top = (event.pageY - (popup.clientHeight / 2)) + 'px'
    popup.style.left = (20 + event.pageX + (srcEl.clientWidth - event.offsetX)) + 'px'
  }
  updatetransaction() {
    this.auth.savetransaction(this.selectedtransaxn).subscribe(data => {
      // console.log(data)
      this.getTransactionList();
    })
  }
  transaxnlsttxt: string = ""
  compare() {
    this.transaxnlsttxt = ""
    this.modalService.open(this.compare_modal, {
      centered: true,
      size: 'lg',
      backdropClass: 'z-index-1',
    })
  }
  scan() {
    console.log(this.transaxnlsttxt)
    let splitData = this.transaxnlsttxt.split("\n").map(x => x.split("\t").filter(x => x != ""))
    console.log(splitData)
    let headers = splitData[0]
    let arr: any[] = []
    splitData.slice(1).forEach(line => {
      let obj: any = {}
      headers.forEach((hdr,i) => {
        obj[hdr] = line[i]
      })
      obj["Net Amount"] = +obj["Net Amount"]
      arr.push(obj)
    })
    console.log(arr)
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
  copyworef(obj: any) {
    return JSON.parse(JSON.stringify(obj))
  }
}
