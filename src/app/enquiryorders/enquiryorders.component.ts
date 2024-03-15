import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
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
  Transaction,
} from './order.module';
import { SignalrService } from '../services/signalr/signalr.service';
import { dtrangepicker } from '../../assets/dist/js/datePickerHelper';
import html2canvas from 'html2canvas';

declare function setHeightWidth(): any;
declare const feather: any, $: any;
declare const $wrapper: any;
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
  orders: any = [];
  customer: CustomerModule;
  transaction: Transaction;
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
    [-1, 'Cancelled', 'text-danger'],
    [0, 'Not Accepted', 'text-secondary'],
    [1, 'Accepted', 'text-primary'],
    [3, 'Preparing', 'text-warning'],
    [4, 'Prepared', 'text-purple'],
    [5, 'Completed', 'text-success'],
  ];

  fromdate: string = '';
  todate: string = '';
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
    this.transaction = new Transaction();
    console.log(this.plusIcon);
    this.phone_num_reg;
    this.signalR.hubconnection.on(
      'DeliveryOrderUpdate',
      (fromstoreid, tostoreid, invoiceno) => {
        if (invoiceno.includes('WO')) {
          console.log('DeliveryOrderUpdate', fromstoreid, tostoreid, invoiceno);
          const orderid = +invoiceno.split(' | ')[1];
          this.getSingleOrder(orderid);
        }
      }
    );
  }

  getENQOrders() {
    console.log('fetching enquiry orders');
    this.Auth.getENQOrders(0).subscribe((data: any) => {
      console.log(data);
      this.orders = data;
      this.orders = this.orders.map((x: any) => {
        // let json = JSON.parse(x.OrderJson)
        // let status = this.status.filter(y => y[0] == json.OrderStatusId)[0]
        // console.log(status)
        // json.orderstatus = status[1]
        // json.status_class = status[2]
        // json.location = this.stores.filter((y: any) => y.Id == json.StoreId)[0]?.Name || '-'
        return x;
      });
      dtrangepicker('myrangepicker', (start: any, end: any) => {
        // console.log(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
        // this.startdate = start.format('YYYY-MM-DD');
        // this.enddate = end.format('YYYY-MM-DD');
        // this.storeRpt();
        // console.log(document.getElementById("newdrp"))
        this.fromdate = start.format('YYYY-MM-DD');
        this.todate = end.format('YYYY-MM-DD');
      })(moment(), moment());
    });
  }
  getAllStores() {
    this.Auth.getAllstores().subscribe((data: any) => {
      this.stores = data;
      this.getENQOrders();
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
        console.log(this.products);

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
  pformatter = (result: any) => result.Name;
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
                  v.Name.toLowerCase().indexOf(term.toLowerCase()) > -1
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
    this.PaymentTypes();
  }
  selectItem(e: any, quantityel: any) {
    console.log(e, quantityel);
    this.selected_product = new CurrentItemModule(e);
    this.quantity = null;
    if (this.selected_product.OptionGroup.length > 0) {
      this.modalService.open(this.options_details, {
        centered: true,
        backdropClass: 'z-index-1',
      });
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
    this.modalService.open(this.options_details, {
      centered: true,
      backdropClass: 'z-index-1',
    });
  }
  openbdmodal() {
    this.modalService.open(this.bulk_discount, {
      centered: true,
      backdropClass: 'z-index-1',
    });
  }
  // getcustomerbyphonenum() {
  //   this.Auth.getCustomerByPhone(this.customer.PhoneNo).subscribe(
  //     (data: any) => {
  //       if (data.length > 0) {
  //         this.customer.Name = data[0]['Name'];
  //         this.customer.Address = data[0]['Address'];
  //       }
  //     }
  //   );
  // }
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
      this.order.InvoiceNo = 'WO | ';
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
    this.order.PaidAmount = this.totalAmount;
    // this.order.CompanyId = this.store.CompanyId
    // // this.order.
    if (this.singletrans.storeId == this.store.Id) {
      console.log('success');
      this.order.PaidAmount = this.order.BillAmount;
      var transaction = new Transaction();
      transaction = new Transaction();
      transaction.Id = 0;
      transaction.Remaining = 0;
      transaction.Amount = this.order.BillAmount;
      transaction.OrderId = this.order.OrderId;
      transaction.StoreId = this.store.Id;
      transaction.TransDate = moment().format('YYYY-MM-DD');
      transaction.TransDateTime =
        moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss');
      transaction.TranstypeId = 1;
      transaction.UserId = this.order.UserId;
      transaction.CompanyId = this.store.CompanyId;
      transaction.StorePaymentTypeName = this.singletrans.name;
      transaction.StorePaymentTypeId = this.singletrans.id;
      this.transaction = transaction;
      this.order.Transactions.push(this.transaction);
      console.log(this.transaction);
    }

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
    this.store = null;
    this.products = [];
    this.searchTerm = '';
    // this.order.StoreId = this.store.Id;
    // this.order.DeliveryStoreId = this.store.Id;
    // this.order.store = this.store;
    // this.order.CompanyId = this.store.CompanyId;
    this.mode = 'list';
    this.selectedDate = '';
    this.selectedTime = '';
    this.getENQOrders();
    this.totalAmount = 0;
    this.savedData = [];
    this.PaymentTypesValues = [];
    this.order.Transactions = [];
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
    console.log('clickedOutside');
  }
  getenquiryordersbydate() {
    this.Auth.getenqordersbydate(this.fromdate, this.todate).subscribe(
      (data: any) => {
        console.log(data);
        this.orders = data;
        this.orders = this.orders.map((order: any) => {
          // let json = JSON.parse(x.OrderJson)
          let status = this.status.filter(
            (x) => x[0] == order.OrderStatusId
          )[0];
          console.log(status);
          order.orderstatus = status[1];
          order.status_class = status[2];
          order.CustomerDetails = { Name: order.Name, PhoneNo: order.PhoneNo };
          order.location =
            this.stores.filter((x: any) => x.Id == order.StoreId)[0]?.Name ||
            '-';
          return order;
        });
        this.showdatepicker = false;
      }
    );
  }
  getSingleOrder(orderid: number) {
    this.Auth.getENQOrders(orderid).subscribe((data: any) => {
      console.log(data);
      let orders = this.orders;
      const index = orders.findIndex(
        (x: any) => x.InvoiceNo == 'WO | ' + orderid
      );
      let json = JSON.parse(data['orders'][0]['OrderJson']);
      let status = this.status.filter((x) => x[0] == json.OrderStatusId)[0];
      console.log(status);
      json.status = status[1];
      json.status_class = status[2];
      console.log('updating');
      if (index > -1) {
        orders[index] = json;
      } else {
        orders.push(json);
      }
      this.orders = orders;
      console.log('updated', this.orders[index]);
    });
  }
  async viewOrder(order: any) {
    if (!order.hasOwnProperty('Items')) {
      let orderjson: any = await this.Auth.getorderjson(
        order.OdrsId
      ).toPromise();
      console.log(orderjson);
      orderjson = JSON.parse(orderjson.invoices[0].OrderJson);
      this.orders[this.orders.findIndex((x: any) => x.Id == order.Id)] = {
        ...this.orders[this.orders.findIndex((x: any) => x.Id == order.Id)],
        ...orderjson,
      };
      order = { ...order, ...orderjson };
      // return
    }
    this.temp_order = order;
    console.log(this.temp_order);
    // this.GetCusDetails();
    this.modalService.open(this.order_details, {
      size: 'lg',
      backdropClass: 'z-index-1',
    });
  }
  change() {
    this.orders[0].status = 'lkjadhlklksdh';
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

  openDrawer() {
    $wrapper.toggleClass('hk-settings-toggle');
  }

  openModal() {
    $('#myModal').modal('show');
  }

  closeModal() {
    $('#myModal').modal('hide');
  }
  selectedDiscountType: string = 'cash';
  cashDiscount: any;
  percentageDiscount: any;

  toggleDiscountInputs() {
    this.cashDiscount = null;
    this.percentageDiscount = null;
  }

  onOrderTypeChange() {
    console.log('Order Type changed to:', this.order.OrderTypeId);
  }

  orderButtonText: string = 'Clear Order';
  ShowCoics = false;
  toggleOrderStatus() {
    this.ShowCoics = true;
    this.orderButtonText = 'Confirm?';
  }

  CancelClearOrder() {
    this.ShowCoics = false;
    this.orderButtonText = 'Clear Order';
  }

  ClearOrder() {
    this.ShowCoics = false;
    this.orderButtonText = 'Clear Order';
    this.clearOrder();
  }

  selectedDate: any;
  ChangeDate() {
    const monthString =
      this.selectedDate.month < 10
        ? `0${this.selectedDate.month}`
        : `${this.selectedDate.month}`;
    const dayString =
      this.selectedDate.day < 10
        ? `0${this.selectedDate.day}`
        : `${this.selectedDate.day}`;
    const formattedDate = `${this.selectedDate.year}-${monthString}-${dayString}`;
    console.log(formattedDate);
    this.order.DeliveryDate = formattedDate;
  }

  time: any;

  selectedTime: any;
  ChangeTime() {
    console.log(this.selectedTime);
    this.order.DeliveryTime = this.selectedTime;
  }

  getcustomer(number: string) {
    this.Auth.getCustomerByPhone(
      number,
      this.store.CompanyId,
      this.store.Id
    ).subscribe((data: any) => {
      console.log(data);
      this.customer.Name = data[0]['Name'];
      this.customer.Address = data[0]['Address'];
    });
  }

  GetCusDetailsValues: any;
  GetCusDetails(data: any) {
    this.Auth.GetCusDetails(data).subscribe((data: any) => {
      this.GetCusDetailsValues = data['cus'][0];
      console.log(data);
    });
  }

  itemsnew: any;
  GetWOOrdDeails(order: any) {
    this.Auth.GetWOOrdDeails(order).subscribe((data: any) => {
      this.temp_order = data['Deatails'][0];
      this.itemsnew = JSON.parse(data['Deatails'][0].Items);
      console.log(this.itemsnew);
      const modifiedItems = [];
      for (let i = 0; i < this.itemsnew.length; i++) {
        const itemObject = JSON.parse(this.itemsnew[i].Items);
        delete itemObject.Name;
        modifiedItems.push(itemObject);
      }

      this.itemsnew = modifiedItems;
      console.log(this.temp_order.CustomerId);

      this.GetCusDetails(this.temp_order.CustomerId);
      this.modalService.open(this.order_details, {
        size: 'lg',
        backdropClass: 'z-index-1',
      });
    });
  }

  searchText: string = '';
  filteredOrders: any[] = [];

  filterOrders() {
    this.filteredOrders = this.orders.filter(
      (order: any) =>
        (order.CusName &&
          order.CusName.toLowerCase().includes(
            this.searchText.toLowerCase()
          )) ||
        (order.CusPhone &&
          order.CusPhone.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }

  PaymentTypesValues: any = 0;
  PaymentTypes() {
    this.Auth.StorePaymentTypes(this.store.CompanyId, this.store.Id).subscribe(
      (data: any) => {
        this.PaymentTypesValues = data;
        this.PaymentTypesValues.forEach((paymentType: any) => {
          paymentType.selected = false;
          paymentType.saveamounts = 0;
        });
        console.log(data);
      }
    );
  }

  toggleButton(selectedPaymentType: any) {
    this.PaymentTypesValues.forEach((paymentType: any) => {
      paymentType.selected = paymentType === selectedPaymentType;
    });
    console.log(selectedPaymentType);

    this.singletrans = selectedPaymentType;
  }

  transactionlist: Array<Transaction> = [];
  savedData: any;
  saveamounts: any;
  saveData() {
    this.savedData = this.PaymentTypesValues.filter(
      (paymentType: any) => paymentType.saveamounts !== 0
    ).map((paymentType: any) => ({
      Id: paymentType.id,
      name: paymentType.name,
      amount: paymentType.saveamounts,
    }));

    this.savedData.forEach((pt: any) => {
      var transaction = new Transaction();
      transaction = new Transaction();
      this.order.PaidAmount = this.totalAmount;
      transaction.Id = 0;
      transaction.Remaining = this.order.BillAmount - this.totalAmount;
      transaction.Amount = pt.amount;
      transaction.OrderId = this.order.OrderId;
      transaction.StoreId = this.store.Id;
      transaction.TransDate = moment().format('YYYY-MM-DD');
      transaction.TransDateTime =
        moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss');
      transaction.TranstypeId = 1;
      transaction.UserId = this.order.UserId;
      transaction.CompanyId = this.store.CompanyId;
      transaction.StorePaymentTypeName = pt.name;
      transaction.StorePaymentTypeId = pt.id;
      this.transaction = transaction;
      this.order.Transactions.push(this.transaction);
      console.log(this.transaction);
    });
    console.log(this.savedData);
    console.log(this.transaction);

    this.singletrans = [];
    this.PaymentTypesValues.forEach(
      (paymentType: any) => (paymentType.selected = false)
    );
  }

  totalAmount: number = 0;
  calculateTotal() {
    this.totalAmount = this.PaymentTypesValues.reduce(
      (sum: any, paymentType: any) => sum + (paymentType.saveamounts || 0),
      0
    );
  }

  CancelSplit() {
    this.order.Transactions = [];
    this.savedData = [];
    this.totalAmount = 0;
    this.PaymentTypesValues.forEach(
      (paymentType: any) => (paymentType.selected = false)
    );
  }

  singletrans: any;

  printhtmlstyle = `
  <style>
    #printelement {
      width: 270px;
      font-family: monospace;
    }
    .header {
        text-align: center;
    }
    .item-table {
        width: 100%;
    }
    .text-right {
      text-align: right!important;
    }
    .text-left {
      text-align: left!important;
    }
    .text-center {
      text-align: center!important;
    }
    tr.nb, thead.nb {
        border-top: 0px;
        border-bottom: 0px;
    }
    table, h3 {
      empty-cells: inherit;
      font-family: monospace;
      //font-size: small;
      width: 290px;
      padding-left: 0px;
      border-collapse: collapse;
    }
    table, tr, td {
      border-bottom: 0;
    }
    hr {
      border-top: 1px dashed black;
    }
    tr.bt {
      border-top: 1px dashed black;
      border-bottom: 0px;
    }
    tr {
      padding-top: -5px;
    }

    thead.rd{
      border-top: 1px dashed black;
    }
    
  </style>`;

  printreceipt() {
    var printtemplate = `
    <div id="printelement" style="width: 350px; font-family: monospace; padding-top: 50px; padding-bottom: 50px">
    <div class="header" style="text-align: center;">
        <h3>${this.GetReceiptValues[0].Company}</h3>
        <p>
            ${this.GetReceiptValues[0].Store}, ${
      this.GetReceiptValues[0].Address
    }<br>
            ${this.GetReceiptValues[0].City}, ${
      this.GetReceiptValues[0].ContactNo
    }
            GSTIN:${this.GetReceiptValues[0].GST}<br>
            <strong>Receipt: ${this.GetReceiptValues[0].Invoice}</strong><br>
            ${moment(this.GetReceiptValues[0].OderedDate).format('LLLL')}
            <br>
            Customer Mobile : ${this.GetReceiptValues[0].CusPhone}
        </p>
    </div>
    <hr>
    <table class="item-table" style="width: 100%; empty-cells: inherit; font-family: monospace; width: 290px; margin: auto; border-collapse: collapse;">
        <thead class="nb" style="border-top: 0px;
        border-bottom: 0px; border-bottom: 0.5px solid grey;">
            <th class="text-left" style="width: 100px;text-align: left!important;" colspan="2"><strong>ITEM</strong></th>
            <th class="text-right" style="text-align: center!important;"><strong>QTY</strong></th>
            <th class="text-right"><strong>PRICE</strong></th>
        </thead>
        <tbody>`;
    var extra = 0;
    this.GetReceiptValues.forEach((item: any) => {
      printtemplate += `
      <tr class="nb" style="border-top: 0px;
      border-bottom: 0px; border-bottom: 0.5px solid grey;">
          <td class="text-left" style="width: 100px;text-align: left!important;" colspan="2">${
            item.ITEM
          }</td>
          <td class="text-right" style="text-align: center!important;">${
            item.QTY
          }${
        item.ComplementryQty > 0 ? '(' + item.ComplementryQty + ')' : ''
      }</td>
      <td class="text-right">${item.Price.toFixed(2)}</td>
      </tr>`;
      extra += item.Extra;
    });
    printtemplate += `
    <tr class="bt">
        <td class="text-left"><strong>Sub Total</strong></td>
        <td colspan="2"></td>
        <td class="text-right">${(
          this.GetReceiptValues[0].Bill -
          this.GetReceiptValues[0].CGST +
          this.GetReceiptValues[0].SGST
        ).toFixed(2)}</td>
    </tr>
    <tr class="nb" ${
      this.GetReceiptValues[0].OrderTotDisc +
        this.GetReceiptValues[0].AllItemTotalDisc ==
      0
        ? 'hidden'
        : ''
    }>
        <td class="text-left"><strong>Discount</strong></td>
        <td colspan="2"></td>
        <td class="text-right">${(+(
          this.GetReceiptValues[0].OrderTotDisc +
          this.GetReceiptValues[0].AllItemTotalDisc
        ).toFixed(0)).toFixed(2)}</td>
    </tr>
    <tr class="nb">
        <td class="text-left"><strong>CGST</strong></td>
        <td colspan="2"></td>
        <td class="text-right">${this.GetReceiptValues[0].CGST.toFixed(2)}</td>
    </tr>
    <tr class="nb">
        <td class="text-left"><strong>SGST</strong></td>
        <td colspan="2"></td>
        <td class="text-right">${this.GetReceiptValues[0].SGST.toFixed(2)}</td>
    </tr>`;
    printtemplate += `
          <tr class="nb" ${this.GetReceiptValues[0].Extra > 0 ? '' : 'hidden'}>
              <td class="text-left"><strong>Extra</strong></td>
              <td colspan="2"></td>
              <td class="text-right">${this.GetReceiptValues[0].Extra.toFixed(
                2
              )}</td>
          </tr>
          <tr class="nb">
              <td class="text-left"><strong>Paid</strong></td>
              <td colspan="2"></td>
              <td class="text-right">${this.GetReceiptValues[0].Paid.toFixed(
                2
              )}</td>
          </tr>
          <tr class="nb">
              <td class="text-left"><strong>Total</strong></td>
              <td colspan="2"></td>
              <td class="text-right">${this.GetReceiptValues[0].Bill.toFixed(
                2
              )}</td>
          </tr>
          <tr class="nb" ${
            this.GetReceiptValues[0].Bill - this.GetReceiptValues[0].Paid > 0
              ? ''
              : 'hidden'
          }>
              <td class="text-left"><strong>Balance</strong></td>
              <td colspan="2"></td>
              <td class="text-right">${(
                this.GetReceiptValues[0].Bill - this.GetReceiptValues[0].Paid
              ).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <hr>
      <div class="text-center">
        <p>Powered By Biz1Book.</p>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', printtemplate);
    const newPrintElement = document.getElementById('printelement');

    if (newPrintElement) {
      html2canvas(newPrintElement).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${this.savedfilename}.png`;

        link.click();

        newPrintElement.remove();
        this.Auth.isloading.next(false);
      });
    } else {
      console.error("Print element with id 'printelement' not found.");
    }
  }
  @ViewChild('printElement') printElement: ElementRef | any;

  savedfilename: any;
  GetReceiptValues: any;
  GetReceipt_WO(data: any) {
    this.Auth.GetReceipt_WO(data.OdrsId).subscribe((data: any) => {
      this.GetReceiptValues = data;
      this.printreceipt();
      this.Auth.isloading.next(true);
      this.savedfilename =
        this.GetReceiptValues[0].Invoice +
        '/' +
        this.GetReceiptValues[0].CusPhone;
    });
  }

  @ViewChild('CancelModel', { static: false }) public CancelModel:
    | TemplateRef<any>
    | any;
  openCancelmodal(data: any) {
    this.modalService.open(this.CancelModel, {
      centered: true,
      backdropClass: 'z-index-1',
    });
    this.savedcancelOrdId = data;
  }

  cancelreason: any;
  savedcancelOrdId: any;
  cancelorder() {
    this.Auth.cancelorder(this.savedcancelOrdId, this.cancelreason).subscribe(
      (res: any) => {
        this.getENQOrders();
      }
    );
  }
}

class CartSettings {
  message_or_note: string;

  constructor() {
    this.message_or_note = 'NOTE';
  }
}
