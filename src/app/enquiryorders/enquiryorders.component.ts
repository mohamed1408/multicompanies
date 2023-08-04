import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import * as _ from 'lodash';
import * as moment from 'moment';

import { AuthService } from '../auth.service';
import {
  CurrentItemModule,
  CustomerModule,
  OrderItemModule,
  OrderModule,
} from './order.module';
import { SignalrService } from '../services/signalr/signalr.service';
import { daterangepicker } from '../../assets/dist/js/datePickerHelper';

declare function setHeightWidth(): any;
declare const feather: any, $: any;
@Component({
  selector: 'app-enquiryorders',
  templateUrl: './enquiryorders.component.html',
  styleUrls: ['./enquiryorders.component.css'],
})
export class EnquiryordersComponent implements OnInit {
  @ViewChild('options_details', { static: false }) public options_details:
    | TemplateRef<any>
    | any;
  @ViewChild('bulk_discount', { static: false }) public bulk_discount:
    | TemplateRef<any>
    | any;
  @ViewChild('order_details', { static: false }) public order_details:
    | TemplateRef<any>
    | any;

  stores: any = [];
  store: any;
  storeid: number = 0;
  mode: string = 'list';
  searchTerm: string = '';
  pdsearchTerm: string = '';
  products: any = [];
  order: OrderModule;
  temp_order: any;
  orders: any = []
  customer: CustomerModule;
  sections = {
    customer: {
      collapse: false,
    },
    order: {
      collapse: true,
    },
  };
  loading: boolean = false;
  page_loading: boolean = false;

  quantity: number | null = null;
  selected_product: CurrentItemModule | null = null;

  feather: any;

  plusIcon: SafeHtml;
  minusIcon: SafeHtml;

  icons: any;
  cart_settings: CartSettings;
  phone_num_reg: RegExp =
    /((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/;

  status = [
    [-1, "Cancelled", "text-danger"],
    [0, "Not Accepted", "text-secondary"],
    [1, "Accepted", "text-primary"],
    [3, "Preparing", "text-warning"],
    [4, "Prepared", "text-purple"],
    [5, "Completed", "text-success"],
  ]

  fromdate: string = ''
  todate: string = ''
  showdatepicker: boolean = false;

  constructor(
    private Auth: AuthService,
    private modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private signalR: SignalrService
  ) {
    this.order = new OrderModule(3);
    // this.customer.Address;
    this.plusIcon = sanitizer.bypassSecurityTrustHtml(
      feather.icons.plus.toSvg()
    );
    this.minusIcon = sanitizer.bypassSecurityTrustHtml(
      feather.icons.minus.toSvg()
    );
    this.cart_settings = new CartSettings();
    this.customer = new CustomerModule();
    console.log(this.plusIcon);
    this.phone_num_reg;
    this.signalR.hubconnection.on('DeliveryOrderUpdate', (fromstoreid, tostoreid, invoiceno) => {
      if (invoiceno.includes("ENQ")) {
        console.log('DeliveryOrderUpdate', fromstoreid, tostoreid, invoiceno)
        const orderid = +invoiceno.split(' | ')[1]
        this.getSingleOrder(orderid)
      }
    })
  }

  getENQOrders() {
    console.log("fetching enquiry orders")
    this.Auth.getENQOrders().subscribe((data: any) => {
      console.log(data)
      this.orders = data["orders"]
      this.orders = this.orders.map((x: any) => {
        let json = JSON.parse(x.OrderJson)
        let status = this.status.filter(y => y[0] == json.OrderStatusId)[0]
        console.log(status)
        json.orderstatus = status[1]
        json.status_class = status[2]
        json.location = this.stores.filter((y: any) => y.Id == json.StoreId)[0]?.Name || '-'
        return json
      })
      daterangepicker('myrangepicker', (start: any, end: any) => {
        // console.log(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
        // this.startdate = start.format('YYYY-MM-DD');
        // this.enddate = end.format('YYYY-MM-DD');
        // this.storeRpt();
        // console.log(document.getElementById("newdrp"))
        this.fromdate = start.format('YYYY-MM-DD')
        this.todate = end.format('YYYY-MM-DD')
      })(moment(), moment());
    })
  }
  getAllStores() {
    this.Auth.getAllstores().subscribe((data: any) => {
      this.stores = data;
      this.getENQOrders()
      // this.Stores.unshift()
    });
  }
  getcompanyproducts() {
    // this.page_loading = true
    this.Auth.isloading.next(true);
    this.products = [];
    this.Auth.getCompanyProducts(this.store.CompanyId, this.store.Id).subscribe(
      (data: any) => {
        this.products = data;
        // this.page_loading = false
        this.Auth.isloading.next(false);
      },
      (error) => {
        console.log(error);
        this.Auth.isloading.next(false);
      },
      () => {
        console.log('completed');
        this.Auth.isloading.next(false);
      }
    );
  }
  ngOnInit(): void {
    this.getAllStores();
    setHeightWidth();
    this.feather = feather;
    console.log(this.feather);
  }
  formatter = (result: any) => result.Name;
  pformatter = (result: any) => result.Product;
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
  prodsearch: OperatorFunction<string, readonly string[]> = (
    text$: Observable<string>
  ) =>
    text$.pipe(
      // debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : this.products
            .filter(
              (v: any) =>
                v.Product.toLowerCase().indexOf(term.toLowerCase()) > -1
            )
            .slice(0, 10)
      )
    );
  selected(e: any) {
    this.store = e;
    this.order = new OrderModule(3);
    this.order.StoreId = this.store.Id;
    this.order.DeliveryStoreId = this.store.Id;
    this.order.store = this.store;
    this.order.CompanyId = this.store.CompanyId;
    this.getcompanyproducts();
  }
  selectItem(e: any, quantityel: any) {
    this.selected_product = new CurrentItemModule(e);
    this.quantity = null;
    if (this.selected_product.OptionGroup.length > 0) {
      this.modalService.open(this.options_details, { centered: true, backdropClass: 'z-index-1' });
      return;
    }
    quantityel.focus();
  }
  addItem() {
    console.log(this.quantity, this.selected_product?.Quantity);
    this.order.additem(this.selected_product, {
      quantity: this.quantity || this.selected_product?.Quantity || 1,
      key: '',
    });
    this.quantity = null;
    this.pdsearchTerm = '';
    $('#autocompleteel').focus();
    this.modalService.dismissAll();
  }
  editItem(item: OrderItemModule) {
    this.selected_product = new CurrentItemModule(
      JSON.parse(JSON.stringify(item))
    );
    this.modalService.open(this.options_details, { centered: true, backdropClass: 'z-index-1' });
  }
  openbdmodal() {
    this.modalService.open(this.bulk_discount, { centered: true, backdropClass: 'z-index-1' });
  }
  getcustomerbyphonenum() {
    this.Auth.getCustomerByPhone(this.customer.PhoneNo).subscribe(
      (data: any) => {
        if (data.length > 0) {
          this.customer.Name = data[0]['Name'];
          this.customer.Address = data[0]['Address'];
        }
      }
    );
  }
  generatekot() {
    var groupeditems = _.mapValues(
      _.groupBy(
        this.order.Items.filter(
          (x) => x.Quantity + x.ComplementryQty - x.kotquantity != 0
        ),
        'KOTGroupId'
      )
    );
    Object.keys(groupeditems).forEach((key) => {
      this.order.addkot(groupeditems[key], -1);
      // this.updatekotno()
    });
    if (this.order.OrderNo == 0) {
      this.order.OrderNo = -1;
      this.order.InvoiceNo = 'ENQ | ';
      // this.updateorderno()
    } else {
      if (!this.order.changeditems.includes('kot'))
        this.order.changeditems.push('kot');
    }
    this.order.Items = this.order.Items.filter(
      (x) => x.Quantity + x.ComplementryQty != 0
    );
    // localStorage.setItem("testorder", JSON.stringify(this.order))
    this.order.setrefid();
    this.order.KOTS.forEach((kot) => {
      kot.CreatedDate = moment().format('YYYY-MM-DD hh:mm A');
      kot.ModifiedDate = moment().format('YYYY-MM-DD hh:mm A');
      kot.invoiceno = this.order.InvoiceNo;
      kot.ordertypeid = this.order.OrderTypeId;
      kot.CompanyId = this.store.CompanyId;
      kot.StoreId = this.store.Id;
      if (!kot.isprinted) {
        // this.savekot(new KDSKotModule(kot, this.order))
        // // console.log("new kot")
        // this.orderlogging('new_kot')
        // kot.isprinted = true
        // if (this.order.OrderTypeId != 5) this.printkot(kot)
      }
    });
    this.order.setkotquantity();
    // if (this.order.OrderTypeId == 1) {
    //   this.savetblorder()
    // }
    // // console.log(this.order.KOTS)
  }
  form_validation = {
    phoneno: false,
    deliverydate: false,
    deliverytime: false,
  };
  validation() {
    // console.log(
    //   this.order.DeliveryDate,
    //   this.order.DeliveryTime,
    //   this.order.BillAmount > 0 &&
    //     (this.order.DeliveryDate == null || this.order.DeliveryDate == '')
    // );
    let valid: boolean = true;
    this.form_validation = {
      phoneno: !this.phone_num_reg.test(this.customer.PhoneNo),
      deliverydate:
        this.order.BillAmount > 0 &&
        (!this.order.DeliveryDate || this.order.DeliveryDate == ''),
      deliverytime:
        this.order.BillAmount > 0 &&
        (!this.order.DeliveryTime || this.order.DeliveryTime == ''),
    };
    // if (!this.phone_num_reg.test(this.customer.PhoneNo)) {
    //   valid = false;
    //   this.form_validation.phoneno = true;
    //   this.sections.customer.collapse = false;
    // }
    // if (!this.order.DeliveryDate) {
    //   valid = false;
    //   this.form_validation.deliverydate = true;
    // }
    // if (!this.order.DeliveryTime) {
    //   valid = false;
    //   this.form_validation.deliverytime = true;
    // }
    return !(
      this.form_validation.deliverydate ||
      this.form_validation.deliverytime ||
      this.form_validation.phoneno
    );
  }
  saveOrder() {
    if (!this.validation()) {
      return;
    }
    // return;
    this.loading = true;
    this.generatekot();
    this.order.OrderedDateTime = moment().format('YYYY-MM-DD hh:mm A');
    this.order.OrderedDate = moment().format('YYYY-MM-DD');
    this.order.BillDateTime = moment().format('YYYY-MM-DD hh:mm A');
    this.order.BillDate = moment().format('YYYY-MM-DD');
    this.order.DeliveryDateTime = moment(
      this.order.DeliveryDate + ' ' + this.order.DeliveryTime
    ).format('YYYY-MM-DD hh:mm A');
    this.customer.CompanyId = this.store.CompanyId;
    this.customer.StoreId = this.store.Id;
    this.order.CustomerDetails = this.customer;
    // this.order.CompanyId = this.store.CompanyId
    // // this.order.
    if (this.order.DeliveryDateTime == 'Invalid date')
      this.order.DeliveryDateTime = null;
    console.log(JSON.stringify(this.order));
    this.Auth.saveorder({ OrderJson: JSON.stringify(this.order) }).subscribe(
      (data) => {
        console.log(data);
        this.loading = false;
        this.clearOrder();
      }
    );
    Object.keys(this.order).forEach((key) => {
      if (typeof this.order[key as keyof OrderModule] == 'number') {
        console.log(
          key,
          this.order[key as keyof OrderModule],
          typeof this.order[key as keyof OrderModule]
        );
      }
    });
    // console.log()
  }
  clearOrder() {
    this.form_validation = {
      phoneno: false,
      deliverydate: false,
      deliverytime: false,
    };
    this.order = new OrderModule(3);
    this.customer = new CustomerModule();
    this.store = null
    this.products = []
    this.searchTerm = ""
    // this.order.StoreId = this.store.Id;
    // this.order.DeliveryStoreId = this.store.Id;
    // this.order.store = this.store;
    // this.order.CompanyId = this.store.CompanyId;
    this.mode = "list"
    this.getENQOrders()
  }
  setcurrentitemprice() {
    var singleqtyoptionprice = 0;
    if (this.selected_product) {
      this.selected_product.TotalAmount = 0;
      this.selected_product.OptionGroup.forEach((opg) => {
        if (opg.selected) {
          opg.Option.forEach((option) => {
            if (option.selected) {
              if (option.IsSingleQtyOption) {
                singleqtyoptionprice += option.Price;
              } else {
                if (this.selected_product)
                  this.selected_product.TotalAmount += option.Price;
              }
            }
          });
        }
      });
      this.selected_product.TotalAmount += this.selected_product.Price;
      this.selected_product.TotalAmount *= this.selected_product.Quantity;
      this.selected_product.TotalAmount += singleqtyoptionprice;
      if (this.selected_product.DiscType == 1) {
        this.selected_product.TotalAmount -= this.selected_product.DiscAmount;
      } else if (this.selected_product.DiscType == 2) {
        this.selected_product.TotalAmount -=
          (this.selected_product.TotalAmount *
            this.selected_product.DiscPercent) /
          100;
      }
    }
    console.log(this.selected_product?.TotalAmount);
  }
  variantAl(vgId: number, varId: number) {
    this.selected_product?.OptionGroup.filter(
      (x) => x.OptionGroupType == 1
    ).forEach((vg) => {
      if (vg.Id == vgId) {
        vg.Option.forEach((va) => {
          vg.selected = varId;
          if (va.Id == varId) {
            va.selected = true;
          } else va.selected = false;
          console.log(va.Name, va.selected);
        });
      } else {
        vg.selected = 0;
      }
    });
    this.setcurrentitemprice();
  }
  addonAl() {
    this.selected_product?.OptionGroup.filter(
      (x) => x.OptionGroupType == 2
    ).forEach((ag) => {
      if (ag.Option.some((x) => x.selected)) ag.selected = true;
      else ag.selected = false;
    });
    this.setcurrentitemprice();
  }
  test() {
    console.log("clickedOutside")
  }
  getenquiryordersbydate() {
    this.Auth.getenqordersbydate(this.fromdate, this.todate).subscribe((data: any) => {
      console.log(data)
      this.orders = data
      this.orders = this.orders.map((order: any) => {
        // let json = JSON.parse(x.OrderJson)
        let status = this.status.filter(x => x[0] == order.OrderStatusId)[0]
        console.log(status)
        order.orderstatus = status[1]
        order.status_class = status[2]
        order.CustomerDetails = { Name: order.Name, PhoneNo: order.PhoneNo }
        order.location = this.stores.filter((x: any) => x.Id == order.StoreId)[0]?.Name || '-'
        return order
      })
      this.showdatepicker = false
    })
  }
  getSingleOrder(orderid: number) {
    this.Auth.getENQOrders(orderid).subscribe((data: any) => {
      console.log(data)
      let orders = this.orders
      const index = orders.findIndex((x: any) => x.InvoiceNo == "ENQ | " + orderid)
      let json = JSON.parse(data["orders"][0]["OrderJson"])
      let status = this.status.filter(x => x[0] == json.OrderStatusId)[0]
      console.log(status)
      json.status = status[1]
      json.status_class = status[2]
      console.log("updating")
      if (index > -1) {
        orders[index] = json
      } else {
        orders.push(json)
      }
      this.orders = orders
      console.log("updated", this.orders[index])
    })
  }
  async viewOrder(order: any) {
    if (!order.hasOwnProperty("Items")) {
      let orderjson: any = await this.Auth.getorderjson(order.Id).toPromise()
      console.log(orderjson)
      orderjson = JSON.parse(orderjson.invoices[0].OrderJson)
      this.orders[this.orders.findIndex((x: any) => x.Id == order.Id)] = { ...this.orders[this.orders.findIndex((x: any) => x.Id == order.Id)], ...orderjson }
      order = { ...order, ...orderjson }
      // return
    }
    this.temp_order = order
    this.modalService.open(this.order_details, { size: 'lg', backdropClass: 'z-index-1' })
  }
  change() {
    this.orders[0].status = "lkjadhlklksdh"
  }

  hidecontent: boolean = true;
  keycode: string = 'sorrymaintenanceare';
  keyarr: Array<string> = [];
  unlockpagr(key: string) {
    this.keyarr = [...this.keyarr, key];
    if (this.keyarr.length == 3) {
      this.hidecontent = !(this.keyarr.join('') == this.keycode);
    }
  }
}

class CartSettings {
  message_or_note: string;

  constructor() {
    this.message_or_note = 'NOTE';
  }
}
