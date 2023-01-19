import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { AuthService } from '../auth.service';
import { daterangepicker } from '../../assets/dist/js/datePickerHelper';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-susorders',
  templateUrl: './susorders.component.html',
  styleUrls: ['./susorders.component.css'],
})
export class SusordersComponent implements OnInit {
  @ViewChild('kotInfo', { static: false }) private kotInfo: ElementRef | any;

  companyid: number = 0;
  storeid: number = 0;
  fromdate: string = '';
  todate: string = '';
  searchTerm: string = '';
  stores: any[] = [];

  cancelledItemOrders: any = [];
  discountedOrders: any = [];
  selectedKots: any = [];
  selectedItems: any = [];

  constructor(private auth: AuthService, private modalService: NgbModal) {
    // this.kotInfo = undefined
    var logInfo = JSON.parse(localStorage.getItem('loginInfo') || '{}');
    this.companyid = logInfo.CompanyId;
  }

  ngOnInit() {
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
    setHeightWidth();
    daterangepicker('myrangepicker', (start: any, end: any) => {
      this.fromdate = start.startOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.todate = end.endOf('day').format('YYYY-MM-DD HH:mm:ss');
      console.log(this.fromdate, this.todate);
    })(moment(), moment());
  }

  ngOnDestroy() {
    this.auth.companies.subscribe((comps) => {
      this.auth.companies.next(comps.filter(x => x.CompanyId != 0))
    });
  }

  getSusOrders() {
    console.log(this.storeid, this.companyid)
    this.auth
      .getSusOrders(this.companyid, this.storeid, this.fromdate, this.todate)
      .subscribe((data: any) => {
        if (data['status'] == 200) {
          this.cancelledItemOrders = data['byCancelledItems'];
          this.discountedOrders = data['byDiscount'];

          this.discountedOrders.forEach((order: any) => {
            order.json = JSON.parse(order.kots);
            order.items = JSON.parse(order.items);
            order.items.customerdetails = JSON.parse(order.CustomerDetails);
            order.items.OrderedDateTime = order.OrderedDateTime;
            order.items.Discount = order.Discount = +order.Discount.toFixed(2);
          });
          this.cancelledItemOrders.forEach((order: any) => {
            order.json = JSON.parse(order.kots);
            order.items = JSON.parse(order.items);
            order.items.OrderedDateTime = order.OrderedDateTime;
            order.items.Discount = order.Discount;
            let product = order.json
              .map((kot: any) => {
                let _it = kot.Items.map((it: any) => {
                  if (it.refid == order.refid) return it;
                }).filter((x: any) => x)[0];
                if (_it) return _it;
              })
              .filter((x: any) => x)[0];
            order.Product = product.showname;
            order.ProductKey = product.ProductKey;
            let prodList = order.json
              .map((kot: any) => {
                let _it = kot.Items.map((it: any) => {
                  if (it.ProductKey == order.ProductKey) return it;
                }).filter((x: any) => x)[0];
                if (_it) return _it;
              })
              .filter((x: any) => x);
            // console.log(prodList);
            order.comment = '';
            order.grossQty = 0;
            prodList.forEach((prod: any, ind: number) => {
              order.grossQty += prod.Quantity;
              order.comment +=
                '<strong>' +
                order.grossQty +
                '</strong>' +
                (ind + 1 == prodList.length ? '' : ' to ');
            });
            order.comment = 'quantity changed from ' + order.comment;
            let added: any = [];
            order.pricechangemap = ``;
            order.isvaliddata = true;
            order.json.forEach((kot: any) => {
              kot.totalsofar = 0;
              added = [...added, ...kot.Items];
              kot.totalsofar = added
                .map((x: any) => this.getItemPrice(x))
                .reduce((pv: any, cv: any) => pv + cv, 0);
              order.pricechangemap += ' -> ' + kot.totalsofar.toFixed(2);
              // console.log(
              //   added.map(
              //     (x) => this.getItemPrice(x)
              //   )
              // );
            });
            order.pricechangemap += ` [BA: ${order.BillAmount}] [EX: ${order.Extra}]`;
            order.isvaliddata =
              +order.json.at(-1).totalsofar.toFixed(0) ==
              order.BillAmount - order.Extra;
            let kot = order.json.filter(
              (x: any) => x.refid == order.kotrefid
            )[0];
            console.log(added);
          });
        }
      });
  }
  getItemPrice = (item: any) => {
    item.TotalAmount = 0;
    if (item.Quantity == 0) return;
    item.TaxAmount1 = 0;
    item.TaxAmount2 = 0;
    item.TaxAmount3 = 0;
    item.TaxAmount = 0;
    item.TotalAmount = 0;
    item.baseprice = 0;
    var optionprice = 0;
    if (item.DiscAmount == null) item.DiscAmount = 0;
    //if(item.DiscPercent > 0) item.DiscAmount = (item.Price*item.Quantity)*item.DiscPercent/100;
    var singleqtyoptionprice = 0;
    item.OptionGroup.forEach((opg: any) => {
      if (opg.selected) {
        opg.Option.forEach((option: any) => {
          if (option.selected) {
            if (option.IsSingleQtyOption) {
              singleqtyoptionprice += option.Price;
            } else {
              optionprice = optionprice + option.Price;
            }
          }
        });
      }
    });
    // console.log(optionprice, singleqtyoptionprice)
    item.baseprice = item.Price + optionprice;
    var actualprice = 0;
    if (item.IsTaxInclusive) {
      item.TotalAmount =
        // (item.Price / (((item.Tax1 + item.Tax2 + item.Tax2) / 100) + 1) + optionprice) * item.Quantity
        (item.baseprice -
          (item.baseprice * (item.Tax1 + item.Tax2)) /
            (item.Tax1 + item.Tax2 + 100)) *
          item.Quantity +
        (singleqtyoptionprice -
          (singleqtyoptionprice * (item.Tax1 + item.Tax2)) /
            (item.Tax1 + item.Tax2 + 100));
    } else {
      item.TotalAmount = item.baseprice * item.Quantity + singleqtyoptionprice;
    }
    item.TaxAmount1 = (item.Tax1 * item.TotalAmount) / 100;
    item.TaxAmount2 = (item.Tax2 * item.TotalAmount) / 100;
    item.TaxAmount3 = (item.Tax3 * item.TotalAmount) / 100;
    item.TaxAmount = item.TaxAmount1 + item.TaxAmount2 + item.TaxAmount3;
    // console.log(item.IsTaxInclusive, item.TotalAmount, item.baseprice, item.TaxAmount)
    var taxdiscpercent = 0;
    if (!item.DiscPercent) item.DiscPercent = 0;
    if (item.DiscAmount || item.DiscPercent) {
      if (item.DiscType == 1) {
        if (false) {
          item.DiscPercent = (item.DiscAmount * 100) / item.TotalAmount;
        } else {
          item.DiscPercent =
            (item.DiscAmount * 100) / (item.TotalAmount + item.TaxAmount);
        }
      }
    }
    // // console.log(item.DiscType, item.DiscPercent)
    item.ItemDiscount = (item.TotalAmount * item.DiscPercent) / 100;
    item.TaxItemDiscount =
      (item.TaxAmount1 * item.DiscPercent) / 100 +
      (item.TaxAmount2 * item.DiscPercent) / 100 +
      (item.TaxAmount3 * item.DiscPercent) / 100;

    item.TotalAmount =
      item.TotalAmount - (item.TotalAmount * item.DiscPercent) / 100;

    item.TaxAmount1 -= (item.TaxAmount1 * item.DiscPercent) / 100;
    item.TaxAmount2 -= (item.TaxAmount2 * item.DiscPercent) / 100;
    item.TaxAmount3 -= (item.TaxAmount3 * item.DiscPercent) / 100;

    item.TaxAmount = item.TaxAmount1 + item.TaxAmount2 + item.TaxAmount3;

    if (item.DiscType == 1) {
      item.DiscPercent = 0;
    }
    console.log(item.TotalAmount, item.TaxAmount);
    return item.TotalAmount + item.TaxAmount;
  };
  viewKotInfo(i: number) {
    this.selectedKots = this.cancelledItemOrders[i].json;
    this.selectedItems = this.cancelledItemOrders[i].items;
    console.log(this.selectedItems, this.selectedKots);
    this.modalService.open(this.kotInfo, { centered: true, size: 'lg', backdropClass: 'z-index-1' });
  }
  viewKotInfo_discounted(i: number) {
    this.selectedKots = this.discountedOrders[i].json;
    this.selectedItems = this.discountedOrders[i].items;
    console.log(this.selectedItems, this.selectedKots);
    this.modalService.open(this.kotInfo, { centered: true, size: 'lg', backdropClass: 'z-index-1' });
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

  getStores() {
    this.auth.GetStores(this.companyid).subscribe((data: any) => {
      this.stores = [{ Id: 0, Name: 'All' }, ...data];
      this.auth.isloading.next(false);
      // console.log(this.stores)
    });
  }
}
