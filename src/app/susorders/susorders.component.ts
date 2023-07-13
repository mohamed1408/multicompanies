import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Ng2SearchPipe } from 'ng2-search-filter';

import { AuthService } from '../auth.service';
import { daterangepicker } from '../../assets/dist/js/datePickerHelper';
import { OrderModule } from '../enquiryorders/order.module';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-susorders',
  templateUrl: './susorders.component.html',
  styleUrls: ['./susorders.component.css'],
  providers: [Ng2SearchPipe],
})
export class SusordersComponent implements OnInit {
  @ViewChild('kotInfo', { static: false }) private kotInfo: ElementRef | any;
  @ViewChild('POStoreArrayModal', { static: false }) private POStoreArrayModal:
    | ElementRef
    | any;

  storeid: number = 0;
  companyid: number = 0;
  sectionid: number = 0;

  // showFutureOrders: boolean = false;

  todate: string = '';
  fromdate: string = '';
  searchTerm: string = '';

  stores: any[] = [];
  selectedKots: any = [];
  selectedItems: any = [];
  discountedOrders: any = [];
  cancelledItemOrders: any = [];

  constructor(
    private auth: AuthService,
    private modalService: NgbModal,
    private ng2FilterPipe: Ng2SearchPipe
  ) {
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
    this.setDateRange();
    setHeightWidth();
  }

  ngOnDestroy() {
    this.auth.companies.subscribe((comps) => {
      this.auth.companies.next(comps.filter((x) => x.CompanyId != 0));
    });
  }
  sumitems(items: any[]) {
    let _items: any[] = []
    items.forEach(x => {
      x.key = x.refid.split(":")[2]
      if (_items.some(y => y.key === x.key)) {
        _items.filter(y => y.key === x.key)[0].Quantity += x.Quantity
        _items.filter(y => y.key === x.key)[0].ComplementryQty += x.ComplementryQty
      } else {
        _items.push(x)
      }
    })
    console.log(_items)
    return _items.filter(x => (x.ComplementryQty + x.Quantity) > 0)
  }
  getSusOrders() {
    console.log(this.storeid, this.companyid);
    this.auth.isloading.next(true);
    this.auth
      .getSusOrders(this.companyid, this.storeid, this.fromdate, this.todate)
      .subscribe((data: any) => {
        if (data['status'] == 200) {
          this.cancelledItemOrders = data['byCancelledItems'];
          this.discountedOrders = data['byDiscount'];

          this.discountedOrders.forEach((order: any) => {
            order.json = JSON.parse(order.kots);
            order.items = this.sumitems(JSON.parse(order.items));
            order.items.customerdetails = JSON.parse(order.CustomerDetails);
            order.items.OrderedDateTime = order.OrderedDateTime;
            order.items.Discount = order.Discount = +order.Discount.toFixed(2);
          });
          this.cancelledItemOrders.forEach((order: any) => {
            order.json = JSON.parse(order.kots);
            order.items = this.sumitems(JSON.parse(order.items)); //JSON.parse(order.items);
            order.items.OrderedDateTime = order.OrderedDateTime;
            order.items.Discount = order.Discount;
            console.log(order)
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
            order.pricechangemap = ``;
            order.isvaliddata = true;
            order.json.forEach((kot: any) => {
              let added: any = [];
              kot.totalsofar = 0;
              added = [...added, ...kot.Items];
              console.log(added, added
                .map((x: any) => this.getItemPrice(x)))
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
            // console.log(added);
          });
        }
        this.auth.isloading.next(false);
      });
  }
  getItemPrice = (item: any) => {
    // console.log(item, item.TotalAmount * (item.Quantity/Math.abs(item.Quantity)))
    return item.TotalAmount * (item.Quantity/Math.abs(item.Quantity))
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
    this.modalService.open(this.kotInfo, {
      centered: true,
      size: 'lg',
      backdropClass: 'z-index-1',
    });
  }
  viewKotInfo_discounted(i: number) {
    this.selectedKots = this.discountedOrders[i].json;
    this.selectedItems = this.discountedOrders[i].items;
    console.log(this.selectedItems, this.selectedKots);
    this.modalService.open(this.kotInfo, {
      centered: true,
      size: 'lg',
      backdropClass: 'z-index-1',
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

  getStores() {
    this.auth.GetStores(this.companyid).subscribe((data: any) => {
      this.storeid = 0
      this.stores = [{ Id: 0, Name: 'All' }, ...data];
      this.auth.isloading.next(false);
      // console.log(this.stores)
    });
  }

  changeSection(sectionid: number) {
    this.sectionid = sectionid;
    if (sectionid == 1) {
      console.log('myrangepicker');
    }
  }

  setDateRange() {
    daterangepicker('myrangepicker', (start: any, end: any) => {
      this.fromdate = start.startOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.todate = end.endOf('day').format('YYYY-MM-DD HH:mm:ss');
      console.log(this.fromdate, this.todate);
    })(moment(), moment());
  }

  // PENDING ORDERS
  @ViewChild('selected_order_list', { static: true })
  selected_order_list: ElementRef | any;
  @ViewChild('orderdetails', { static: true }) orderdetails: ElementRef | any;

  // CompanyId: number = 3;
  orders: any = [];
  allorders: any = [];
  orderItems: any;
  transactions: any;
  data: any;
  orderid: any;
  total: any;
  smodel = '';
  Stores: any;
  // storeId: number = 0;
  startdate: any;
  enddate: any;
  term: string = '';
  ordersSelectState: boolean = false;
  selectedOrders: Array<CompleteOrderPayload> = [];
  p: any;
  paymentTypes: any = [];
  selectedStoreId: number = 0;
  showFutureOrders: boolean = false;
  statusfilter = 0;
  hidepaidorders: boolean = true;

  openDetailpopup(contentdetail: any) {
    const modalRef = this.modalService
      .open(contentdetail, {
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
      })
      .result.then(
        (result) => { },
        (reason) => { }
      );
  }
  POStortesArray: any = [];
  Getpendingorder() {
    this.auth
      .getpendingorder(this.companyid, this.storeid)
      .subscribe((data: { [x: string]: any }) => {
        this.orders = data['Orders'];
        this.allorders = data['Orders'];
        this.filterUnpaidOrders(this.hidepaidorders);
        this.paymentTypes = [];
        this.selectedOrders = [];
        console.log(this.orders);
        const todaystamp = new Date().getTime();
        const today11oclockstamp = new Date(
          moment().format('YY-MM-DD') + ' 11:00 AM'
        ).getTime();
        this.orders.forEach(
          (order: {
            futureOrder: boolean;
            DeliveryDateTime: string | number | Date;
            StoreId: number;
          }) => {
            order.futureOrder =
              todaystamp >= today11oclockstamp &&
              new Date(order.DeliveryDateTime).getTime() > todaystamp;
            if (!this.POStortesArray.some((x: any) => x.Id == order.StoreId))
              this.POStortesArray.push(
                this.stores
                  .filter((x) => x.Id == order.StoreId)
                  .map((x) => {
                    return { ...x, selected: true };
                  })[0]
              );
          }
        );
        this.POStortesArray = this.POStortesArray.sort(
          (a: { CompanyId: number }, b: { CompanyId: number }) =>
            a.CompanyId - b.CompanyId
        );
        this.selectedstores = this.POStortesArray.length;
        this.selectedStoreId = this.storeid;
        if (this.storeid > 0 || this.companyid == 0) this.getPaymentTypes();
      });
  }

  filterUnpaidOrders(val: boolean) {
    if (val)
      this.orders = this.allorders.filter(
        (x: { PaidAmount: any; BillAmount: any }) =>
          x.PaidAmount != x.BillAmount
      );
    else this.orders = this.allorders;
  }

  getPaymentTypes() {
    this.auth
      .getpaymenttypes(this.companyid, this.storeid)
      .subscribe((data: any) => {
        this.paymentTypes = data.filter((x: { IsActive: any }) => x.IsActive);
      });
  }

  getOrderItems(OrderId: any, modalRef: any) {
    console.log(this.orderid);
    this.auth.getOrderId(OrderId).subscribe((data: { [x: string]: any }) => {
      this.orderItems = data['Orders'];
      console.log(this.orderItems);
      this.getTransaction(OrderId, modalRef);
    });
  }

  getTransaction(OrderId: any, modalRef: any) {
    this.auth
      .getTransactionId(OrderId)
      .subscribe((data: { [x: string]: any }) => {
        this.transactions = data['Transactions'];
        console.log(this.transactions);
        this.openDetailpopup(modalRef);
      });
  }

  select(e: any, id: number) {
    let select = e.target.checked;
    console.log(select, id);
    // console.log(this.ng2FilterPipe.transform(this.orders, this.term))
    this.ng2FilterPipe
      .transform(this.orders, this.term)
      .forEach((order: OrderModule) => {
        if (order.Id == id || id == 0) {
          console.log(order, this.paymentTypes);
          order.selected = select;
          if (select) {
            this.selectedOrders = [
              ...this.selectedOrders,
              new CompleteOrderPayload(
                order,
                this.paymentTypes.filter((x: any) => x.StoreId == order.StoreId)
              ),
            ];
          } else {
            this.removeOrder(order);
          }
        }
      });
  }

  removeOrder(order: { Id: number }) {
    this.selectedOrders = this.selectedOrders.filter(
      (x) => x.orderid != order.Id
    );
    console.log(this.selectedOrders.length);
  }

  reviewSelectedOrders() {
    this.modalService.open(this.selected_order_list, {
      centered: true,
      size: 'lg',
      backdropClass: 'z-index-1',
    });
  }

  completeOrders() {
    this.auth.completeOrders(this.selectedOrders).subscribe((data: any) => {
      console.log(data);
      this.Getpendingorder();
      this.modalService.dismissAll();
    });
  }

  selected_order: any;
  selectorder(json: string) {
    this.selected_order = JSON.parse(json);
    console.log(this.selected_order);
    this.modalService.open(this.orderdetails, {
      centered: true,
      size: 'lg',
      windowClass: 'float-right',
      backdropClass: 'z-index-1',
    });
  }
  selectedstores: number = 0;
  openStoresArray() {
    this.modalService.open(this.POStoreArrayModal, {
      centered: true,
      size: 'lg',
      windowClass: 'float-right',
      backdropClass: 'z-index-1',
    });
  }

  togglePOStoreSelect(id: number) {
    this.POStortesArray.filter((x: any) => x.Id == id)[0].selected =
      !this.POStortesArray.filter((x: any) => x.Id == id)[0].selected;
    this.filterOrderbySelectedStores();
  }

  deselctAllStores(bool: boolean) {
    this.POStortesArray.forEach((element: any) => {
      element.selected = false || bool;
    });
    this.filterOrderbySelectedStores();
  }

  filterOrderbySelectedStores() {
    const selected_ids = this.POStortesArray.filter((y: any) => y.selected).map(
      (y: any) => y.Id
    );
    console.log(selected_ids);
    this.selectedstores = selected_ids.length;
    this.orders = this.allorders.filter(
      (x: any) =>
        selected_ids.includes(x.StoreId) &&
        ((this.hidepaidorders && x.PaidAmount != x.BillAmount) ||
          !this.hidepaidorders)
    );
  }
}

class CompleteOrderPayload {
  invoiceno: string;
  orderid: number;
  storeid: number;
  transdatetime: string;
  transdate: string;
  paidamount: number;
  billamount: number;
  orderstatusid: number;
  orderstatus: string;
  store: string;
  paymenttypeid: number;
  ordertype: string;
  showpopover: boolean;
  /**
   *
   */
  constructor(order: OrderModule, pts: any) {
    this.invoiceno = order.InvoiceNo;
    this.orderid = order.Id;
    this.storeid = order.StoreId;
    this.transdatetime = order.DeliveryDateTime || '';
    this.transdate = moment(order.DeliveryDateTime).format('YYYY-MM-DD');
    this.paidamount = order.PaidAmount;
    this.billamount = order.BillAmount;
    this.store = order.Name;
    this.orderstatusid = order.OrderStatusId;
    this.paymenttypeid = pts[0].Id;
    this.ordertype = order.OrderType;
    this.showpopover = false;

    const status: any = {
      '-1': 'Cancelled',
      '0': 'Pending',
      '1': 'Accepted',
      '2': 'Preparing',
      '3': 'Prepared',
      '4': 'Out fo Delivery',
      '5': 'Completed',
    };
    const orderType = {
      '1': 'Dinr In',
      '2': 'Take Away',
      '3': 'Delivery',
      '4': 'Pick Up',
      '5': 'Counter',
    };
    let typeid: string = this.orderstatusid.toString();
    this.orderstatus = status[typeid];
  }
  //YYYY-MM-DDTHH:mm:ss.SSS
  setDateTime() {
    console.log(this.transdate);
    this.transdatetime = this.transdate + moment().format('THH:mm:ss.SSS');
    console.log(this.transdatetime, this.transdate);
  }
}
