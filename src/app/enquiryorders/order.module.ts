// import { ɵSafeHtml } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
// import * as moment from 'moment';
// import * as old from './oldorder.module'
// import { version } from 'package.json'

export class OrderModule {
  OdrsId: number = 0;
  Name: string = '';
  OrderType: string = '';
  selected: any;
  additionalchargearray: Array<AdditionalCharge> = [];
  AggregatorOrderId!: number;
  AllItemDisc: number;
  AllItemTaxDisc: number;
  AllItemTotalDisc: number;
  alltransactions: any = [];
  app: string = 'pos.biz1book.com';
  appversion: string = '-';
  BillAmount: number;
  BillDate!: string;
  BillDateTime!: string;
  BillStatusId: number;
  changeditems: Array<string>;
  ChargeJson!: string;
  Charges!: number;
  Closed!: boolean;
  CompanyId!: number;
  createdtimestamp!: number;
  CustomerAddressId!: number;
  CustomerData!: string;
  CustomerDetails: CustomerModule;
  CustomerId!: number;
  datastatus: string;
  deliveryclicked!: boolean;
  DeliveryDate!: string;
  DeliveryDateTime!: string | null;
  DeliveryStoreId!: number;
  DeliveryTime!: string;
  deliverytimestamp: number;
  DiningTableId!: number;
  diningtablekey: string;
  DiscAmount: number;
  DiscPercent: number;
  DiscType: number;
  events: Array<any>;
  extra!: number;
  FoodReady!: boolean;
  Id!: number;
  InvoiceNo!: string;
  IsAdvanceOrder: boolean;
  isordersaved: boolean;
  istaxinclusive: boolean = false;
  ItemJson!: string;
  Items: Array<OrderItemModule>;
  KOTS: Array<KOTModule>;
  machine_id: string = '';
  ModifiedDate!: string;
  Message!: string;
  Note!: string;
  OrderDiscount: number;
  OrderedDate!: string;
  OrderedDateTime!: string;
  OrderId: number;
  OrderJson!: string;
  OrderName: string;
  OrderNo: number;
  OrderStatusDetails!: string;
  OrderStatusId: number;
  OrderTaxDisc: number;
  OrderTotDisc: number;
  OrderTypeId: number;
  PaidAmount: number;
  PaymentTypeId: number;
  PreviousStatusId: number;
  RefundAmount: number;
  RiderStatusDetails!: string;
  Source!: string;
  SourceId: number;
  SplitTableId!: number;
  status: string;
  statusbtns = [];
  store: any;
  StoreId!: number;
  StorePaymentTypeId: number;
  subtotal: number;
  Tax1: number;
  Tax2: number;
  Tax3: number;
  TaxAmount!: number;
  Transactions: Array<Transaction>;
  UPOrderId!: number;
  UserId!: number;
  UserName!: string;
  WaiterId!: number;
  constructor(ordertypeid: number) {
    var ordertypes: any = {
      '1': 'Dine In',
      '2': 'Take Away',
      '3': 'Pick Up',
      '4': 'Delivery',
      '5': 'Counter',
    };
    // this.CompanyId = companyid
    // this.StoreId = storeid
    this.datastatus = 'edit_order';
    var advance_order_types = [3, 4];
    // this.isordersaved = true;
    this.DiscType = 1;
    this.OrderTypeId = ordertypeid;
    this.OrderName = ordertypes[ordertypeid.toString()];
    this.BillAmount = 0;
    this.BillStatusId = 1;
    this.OrderStatusId = 1;
    this.DiscAmount = 0;
    this.DiscPercent = 0;
    this.OrderDiscount = 0;
    this.OrderNo = 0;
    this.PaidAmount = 0;
    this.PreviousStatusId = 0;
    this.RefundAmount = 0;
    this.SourceId = 1;
    this.Tax1 = 0;
    this.Tax2 = 0;
    this.Tax3 = 0;
    this.Items = [];
    this.KOTS = [];
    this.AllItemDisc = 0;
    this.AllItemTaxDisc = 0;
    this.AllItemTotalDisc = 0;
    this.OrderDiscount = 0;
    this.OrderTaxDisc = 0;
    this.OrderTotDisc = 0;
    this.subtotal = 0;
    this.PaymentTypeId = 6;
    this.StorePaymentTypeId = 0;
    this.events = [];
    this.CustomerDetails = new CustomerModule();
    this.IsAdvanceOrder = advance_order_types.includes(this.OrderTypeId);
    this.status = 'P';
    this.OrderId = 0;
    this.Transactions = [];
    this.changeditems = [];
    this.alltransactions = [];
    this.diningtablekey = '';
    this.isordersaved = true;
    this.deliverytimestamp = 0;
  }

  // ADD PRODDUCT
  additem(product: any, options: any) {
    console.log(product);
    if (product.isorderitem) {
      this.mergeitem(product, options);
      this.setbillamount();
      return;
    }
    // console.log("NOT MERGING")
    var productkey = this.productkeygenerator(product);
    var showname = this.getshowname(product);
    if (this.Items.some((x) => x.ProductKey == productkey)) {
      this.Items.filter((x) => x.ProductKey == productkey)[0].Quantity +=
        options.quantity;
    } else {
      options.key = productkey;
      this.Items.push(new OrderItemModule(product, options, showname));
    }
    this.setbillamount();
    console.log(this.Items);
  }
  mergeitem(product: any, options: any) {
    // console.log('merging item')
    // console.log(this.getshowname(product))
    // console.log(product.ProductKey, this.productkeygenerator(product))
    product.OptionGroup.forEach((opg: any) => {
      opg.Option.forEach((op: any) => {
        if (op.selected) {
          // console.log(op.Name)
        }
      });
    });
    // console.log('----------------------------------')
    var oldkey = product.ProductKey;
    var productkey = this.productkeygenerator(product);
    var showname = this.getshowname(product);
    var index = this.Items.findIndex(
      (x) => x.ProductKey == oldkey && x.Quantity > 0
    );
    // console.log(index, oldkey, productkey)
    options.key = productkey;
    this.Items[index].Quantity = 0;
    // console.log(this.Items[index].showname)
    // console.log(this.Items[index].ProductKey)
    this.Items[index].OptionGroup.forEach((opg) => {
      opg.Option.forEach((op) => {
        if (op.selected) {
          // console.log(op.Name)
        }
      });
    });
    // console.log('----------------------------------')
    // console.log(product, this.Items[index])
    this.Items.push(new OrderItemModule(product, options, showname));
    // this.Items[index] = new OrderItemModule(product, options, showname)
    // console.log(
    //   product,
    //   options,
    //   showname,
    //   new OrderItemModule(product, options, showname)
    // );
  }

  productkeygenerator(product: any) {
    console.trace(product);
    console.log(product.ProductId.toString());
    var key = '';
    key = product.ProductId
      ? product.ProductId.toString()
      : product.Id.toString();
    if (product.OptionGroup) {
      product.OptionGroup.forEach((opg: any) => {
        if (opg.selected) {
          opg.Option.forEach((option: any) => {
            if (option.selected) {
              key += '_' + option.Id;
            }
          });
        }
      });
    }
    return key;
  }
  getshowname(product: OrderItemModule) {
    var name = product.Name;
    if (product.OptionGroup) {
      product.OptionGroup.forEach((opg) => {
        if (opg.selected) {
          opg.Option.forEach((option) => {
            if (option.selected) {
              if (opg.OptionGroupType == 1) name += '/' + option.Name;
              if (opg.OptionGroupType == 2) name += '+' + option.Name;
            }
          });
        }
      });
    }
    return name;
  }
  // BILL AMOUNT CALCULATION LOGIC
  setbillamount() {
    var extracharge = 0;
    this.BillAmount = 0;
    this.Tax1 = 0;
    this.Tax2 = 0;
    this.Tax3 = 0;
    this.AllItemDisc = 0;
    this.AllItemTaxDisc = 0;
    this.AllItemTotalDisc = 0;
    this.Charges = 0;
    this.TaxAmount = 0;
    this.extra = 0;
    this.subtotal = 0;
    this.StorePaymentTypeId = 0;
    if (!this.isordersaved) this.PaidAmount = 0;
    var isdiscinclusivoftax = false;

    // console.log(this.BillAmount)
    this.Items.forEach((item) => {
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
      item.OptionGroup.forEach((opg) => {
        if (opg.selected) {
          opg.Option.forEach((option) => {
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
        item.TotalAmount =
          item.baseprice * item.Quantity + singleqtyoptionprice;
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
          if (isdiscinclusivoftax) {
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
      // console.log(this.BillAmount)
      this.extra += item.Extra;
      this.BillAmount += item.TotalAmount;
      this.subtotal += item.TotalAmount;
      this.Tax1 += item.TaxAmount1;
      this.Tax2 += item.TaxAmount2;
      this.Tax3 += item.TaxAmount3;

      this.AllItemDisc += item.ItemDiscount;
      this.AllItemTaxDisc += item.TaxItemDiscount;
      this.AllItemTotalDisc += item.ItemDiscount + item.TaxItemDiscount;
      // console.log(this.BillAmount)
    });
    // console.log(this.BillAmount)

    this.TaxAmount = this.Tax1 + this.Tax2 + this.Tax3;
    if (!this.DiscPercent) this.DiscPercent = 0;
    if (this.DiscAmount || this.DiscPercent) {
      if (this.DiscType == 1) {
        if (isdiscinclusivoftax) {
          this.DiscPercent = (this.DiscAmount * 100) / this.BillAmount;
        } else {
          this.DiscPercent =
            (this.DiscAmount * 100) / (this.BillAmount + this.TaxAmount);
        }
      }
      // // console.log(this.BillAmount, this.DiscPercent, (this.BillAmount * this.DiscPercent) / 100)
      // this.BillAmount -= (this.BillAmount * this.DiscPercent) / 100
    }
    this.OrderDiscount = (this.BillAmount * this.DiscPercent) / 100;
    this.OrderTaxDisc =
      (this.Tax1 * this.DiscPercent) / 100 +
      (this.Tax2 * this.DiscPercent) / 100 +
      (this.Tax3 * this.DiscPercent) / 100;
    this.OrderTotDisc = this.OrderDiscount + this.OrderTaxDisc;

    this.Tax1 -= (this.Tax1 * this.DiscPercent) / 100;
    this.Tax2 -= (this.Tax2 * this.DiscPercent) / 100;
    this.Tax3 -= (this.Tax3 * this.DiscPercent) / 100;
    this.TaxAmount = this.Tax1 + this.Tax2 + this.Tax3;

    this.additionalchargearray.forEach((charge) => {
      // console.log(charge.Description, charge.selected)
      if (charge.selected) {
        if (charge.ChargeType == 2) {
          charge.Amount = Number((this.BillAmount / 100) * charge.ChargeValue);
        } else {
          charge.Amount = Number(charge.ChargeValue);
        }
        extracharge += charge.Amount;
        this.Charges += charge.Amount;
      }
    });
    // this.BillAmount += extracharge

    this.Items.forEach((item) => {
      item.OrderDiscount =
        (item.TotalAmount * this.OrderDiscount) / this.BillAmount;
      if (this.TaxAmount)
        item.TaxOrderDiscount =
          (item.TaxAmount * this.OrderTaxDisc) / this.TaxAmount;
    });
    this.BillAmount +=
      this.TaxAmount + this.extra + this.Charges - this.OrderTotDisc;
    if (this.DiscType == 1) {
      this.DiscPercent = 0;
    }
    this.BillAmount = +(+this.BillAmount.toFixed(0)).toFixed(2);
    this.TaxAmount = +this.TaxAmount.toFixed(2);
    this.Items.forEach((item) => {
      item.TotalAmount = +item.TotalAmount.toFixed(2);
    });
    this.setkotquantity();
    // console.log('-AID', 'AITxD', 'AIToD', '--OD', '-OTxD', '-OToD')
    // console.log(this.AllItemDisc, this.AllItemTaxDisc, this.AllItemTotalDisc, this.OrderDiscount, this.OrderTaxDisc, this.OrderTotDisc)
  }
  setkotquantity() {
    this.Items.forEach((item) => {
      var key = item.ProductKey;
      item.kotquantity = 0;
      this.KOTS.forEach((kot) => {
        kot.Items.forEach((kitem) => {
          if (kitem.ProductKey == key)
            item.kotquantity += kitem.Quantity + kitem.ComplementryQty;
        });
      });
      // // console.log(item.kotquantity)
    });
  }

  addkot(items: any, kotno: any) {
    let item_qty_bykey: any = {};
    // console.log(this.Items)
    this.KOTS.forEach((kot) => {
      kot.Items.forEach((itm) => {
        if (item_qty_bykey[itm.ProductKey]) {
          item_qty_bykey[itm.ProductKey].qty += itm.Quantity;
          item_qty_bykey[itm.ProductKey].free_qty += itm.ComplementryQty;
        } else {
          item_qty_bykey[itm.ProductKey] = {
            qty: itm.Quantity,
            free_qty: itm.ComplementryQty,
          };
        }
      });
    });
    this.KOTS.push(new KOTModule(items, kotno, item_qty_bykey));
  }

  setrefid() {
    this.KOTS.forEach((kot) => {
      kot.orderrefid = this.InvoiceNo;
      kot.refid = this.InvoiceNo + ':' + kot.KOTNo;
      // // console.log(kot.orderrefid, kot.refid)
      kot.Items.forEach((item) => {
        item.kotrefid = kot.refid;
        item.refid = item.kotrefid + ':' + item.ProductKey;
        // // console.log(item.kotrefid, item.refid)
        item.OptionGroup.forEach((OptionGroup) => {
          OptionGroup.Option.forEach((option) => {
            option.orderitemrefid = item.refid;
          });
        });
      });
    });
  }

  //   checkpayload(order) {
  //     if (order.hasOwnProperty('taxGroup')) {
  //       var oldorder: old.OrderModule = order
  //       var neworder: OrderModule
  //       for (var key in neworder) {
  //         if (oldorder.hasOwnProperty(key)) neworder[key] = oldorder[key]
  //       }
  //     }
  //   }

  //   correctitemjson(olditems: Array<old.OrderItemModule>) {
  //     var newitems: Array<OrderItemModule>;
  //     olditems.forEach((item) => {});
  //   }

  //   getQtyByKey(product_key) {
  //     let obj = {
  //       qty: 0,
  //       free_qty: 0,
  //     };
  //     // console.log(this)
  //     this.KOTS.forEach((kot) => {
  //       kot.Items.forEach((item) => {
  //         obj.qty += item.Quantity;
  //         obj.free_qty += item.ComplementryQty;
  //       });
  //     });
  //     return obj;
  //   }

  static parseOnlineItem(raw_json: Item) {
    console.log(raw_json);
    let itemobj = new OrderItemModule({}, {}, '');
    itemobj.TotalAmount = raw_json.total;
    itemobj.showname = raw_json.title;
    itemobj.Product = raw_json.title;
    itemobj.ProductId = +raw_json.refid;
    itemobj.Price = raw_json.price;
    itemobj.ItemDiscount = raw_json.discount;
    itemobj.Message = raw_json.instructions;
    itemobj.Tax1 = raw_json.taxes[0].value;
    itemobj.Tax2 = raw_json.taxes[1].value;
    itemobj.Tax3 = 0;
    itemobj.tax1_p = raw_json.taxes[0].rate;
    itemobj.tax2_p = raw_json.taxes[1].rate;
    itemobj.tax3_p = 0;
    itemobj.Quantity = raw_json.quantity;
    itemobj.ProductKey = raw_json.refid;
    itemobj.KOTGroupId = raw_json.KOTGroupId;
    return itemobj;
  }
}

export class OrderItemModule {
  Id: number;
  CategoryId: number;
  ComplementryQty: number;
  DiscAmount: number;
  DiscPercent: number;
  DiscType: number;
  Extra: number;
  FreeQtyPercentage: number;
  ItemDiscount: number;
  KitchenUserId: number | null;
  KOTGroupId: number;
  KOTId: number;
  Message: string;
  MinimumQty: number;
  Note: string;
  OptionJson: string;
  OptionGroup: Array<OptionGroupModule>;
  OrderDiscount: number;
  OrderId: number;
  Price: number;
  ProductId: number;
  ProductKey: string;
  Name: string;
  Quantity: number;
  StatusId: number;
  tax1_p!: number;
  tax2_p!: number;
  tax3_p!: number;
  Tax1: number;
  Tax2: number;
  Tax3: number;
  TaxGroupId: number;
  TaxItemDiscount: number;
  TaxOrderDiscount: number;
  TotalAmount: number;
  TaxAmount1!: number;
  TaxAmount2!: number;
  TaxAmount3!: number;
  TaxAmount!: number;
  IsTaxInclusive: boolean;
  Product: string;
  showname: SafeHtml;
  isorderitem: boolean;
  kotquantity!: number;
  baseprice!: number;
  kotrefid!: string;
  refid!: string;
  constructor(product: any, options: any, showname: any) {
    this.DiscType = 1;
    this.isorderitem = true;
    this.showname = showname;
    this.Id = 0;
    this.CategoryId = product.CategoryId;
    this.ComplementryQty = product.ComplementryQty
      ? product.ComplementryQty
      : 0;
    this.MinimumQty = product.MinimumQty;
    this.DiscAmount = product.DiscAmount;
    this.DiscPercent = product.DiscPercent;
    this.DiscType = product.DiscType;
    this.Extra = product.Extra ? product.Extra : 0;
    this.FreeQtyPercentage = product.FreeQtyPercentage;
    this.ItemDiscount = 0;
    this.KitchenUserId = null;
    this.KOTGroupId = product.KOTGroupId ? product.KOTGroupId : 0;
    this.KOTId = 0;
    this.Message = '';
    this.MinimumQty = product.MinimumQty;
    this.Name = product.Name;
    this.Product = product.Name;
    this.Note = '';
    this.OptionJson = '';
    this.OptionGroup = [];
    this.OrderDiscount = 0;
    this.OrderId = 0;
    this.ProductId = product.ProductId ? product.ProductId : product.Id;
    this.ProductKey = options.key;
    this.Price = product.Price;
    this.Quantity = options.quantity;
    this.StatusId = 0;
    this.Tax1 = product.Tax1;
    this.Tax2 = product.Tax2;
    this.Tax3 = product.Tax3;
    this.TaxGroupId = product.TaxGroupId;
    this.TaxItemDiscount = 0;
    this.TaxOrderDiscount = 0;
    this.TotalAmount = 0;
    this.IsTaxInclusive = product.IsTaxInclusive;
    // if (this.Quantity >= this.MinimumQty && this.ComplementryQty == 0) {
    //   this.ComplementryQty = (this.Quantity * this.FreeQtyPercentage) / 100
    // }
    if (product.OptionGroup) {
      product.OptionGroup.forEach((opg: any) => {
        if (opg.OptionGroupType == 1) opg.selected = true;
        this.OptionGroup.push(new OptionGroupModule(opg));
      });
    }
  }
}

// export class ItemParser {
//   constructor() {
//     super({}, {}, "")
//   }
// }

export class KOTModule {
  Id!: number;
  KOTStatusId: number;
  Instruction;
  KOTNo: number;
  OrderId: number | null;
  CreatedDate!: string;
  Items: Array<OrderItemModule>;
  ModifiedDate!: string;
  CompanyId!: number;
  StoreId!: number;
  KOTGroupId: number | null;
  added: Array<OrderItemModule>;
  removed: Array<OrderItemModule>;
  isprinted!: boolean;
  orderrefid!: string;
  refid!: string;
  invoiceno!: string;
  ordertypeid!: number;
  constructor(items: Array<OrderItemModule>, kotno: any, kotQuantity: any) {
    // // console.log( moment().format('YYYY-MM-DD HH:MM'), moment().format('YYYY-MM-DD hh:mm A'))
    this.KOTStatusId = 0;
    this.Instruction = '';
    this.KOTNo = kotno;
    this.OrderId = null;
    // this.CreatedDate = moment().format('YYYY-MM-DD HH:MM')
    this.Items = [];
    // this.ModifiedDate = moment().format('YYYY-MM-DD HH:MM')
    // this.CompanyId = 3
    // this.StoreId = 4
    this.KOTGroupId = items[0].KOTGroupId > 0 ? items[0].KOTGroupId : null;
    var options = {
      key: '',
      quantity: 0,
      iskotitem: true,
    };
    items.forEach((item) => {
      var kitem = Object.assign({}, item);
      kitem.Quantity =
        kitem.Quantity -
        (kotQuantity[kitem.ProductKey] ? kotQuantity[kitem.ProductKey].qty : 0); //kitem.kotquantity
      kitem.ComplementryQty =
        kitem.ComplementryQty -
        (kotQuantity[kitem.ProductKey]
          ? kotQuantity[kitem.ProductKey].free_qty
          : 0);
      kitem.kotquantity += options.quantity;
      this.Items.push(kitem);
    });
    this.added = this.Items.filter((x) => x.Quantity + x.ComplementryQty > 0);
    this.removed = this.Items.filter((x) => x.Quantity < 0);
  }
}

export class OptionGroupModule {
  Id: number;
  Name: string;
  OptionGroupType: number;
  Option: Array<OptionModule>;
  MinimumSelectable: number;
  MaximumSelectable: number;
  SortOrder: number;
  selected: number | boolean;
  collapsed: boolean;
  constructor(optiongroup: any) {
    this.collapsed = true;
    this.Id = optiongroup.Id;
    this.Name = optiongroup.Name;
    this.OptionGroupType = optiongroup.OptionGroupType;
    this.MinimumSelectable = optiongroup.MinimumSelectable;
    this.MaximumSelectable = optiongroup.MaximumSelectable;
    this.SortOrder = optiongroup.SortOrder ? optiongroup.SortOrder : -1;
    this.selected = optiongroup.selected;
    this.Option = [];
    if (this.OptionGroupType == 1) {
      if (!optiongroup.Option.some((x: any) => x.selected == true)) {
        optiongroup.Option[0].selected = true;
      }
    }
    optiongroup.Option.forEach((option: any) => {
      this.Option.push(new OptionModule(option));
    });
  }
}

export class OptionModule {
  Id: number;
  DeliveryPrice: number;
  Name: string;
  Price: number;
  selected: boolean;
  TakeawayPrice: number;
  orderitemrefid!: string;
  IsSingleQtyOption: boolean;
  constructor(option: any) {
    this.Id = option.Id;
    this.DeliveryPrice = option.DeliveryPrice;
    this.Name = option.Name;
    this.Price = option.Price;
    this.selected = option.selected;
    this.TakeawayPrice = option.TakeawayPrice;
    this.IsSingleQtyOption = option.IsSingleQtyOption;
  }
}
export class CurrentItemModule {
  Id: number;
  CategoryId: number;
  ComplementryQty: number;
  DiscAmount: number;
  DiscPercent: number;
  DiscType: number;
  Extra: number;
  FreeQtyPercentage: number;
  ItemDiscount: number;
  KitchenUserId: number | null;
  KOTGroupId: number;
  KOTId: number;
  Message: string;
  MinimumQty: number;
  Note: string | null;
  OptionJson: string;
  OptionGroup: Array<OptionGroupModule>;
  OrderDiscount: number;
  OrderId: number;
  Price: number;
  ProductId: number;
  ProductKey: string;
  Name: string;
  Quantity: number;
  StatusId: number;
  tax1_p!: number;
  tax2_p!: number;
  tax3_p!: number;
  Tax1: number;
  Tax2: number;
  Tax3: number;
  TaxGroupId: number;
  TaxItemDiscount: number;
  TaxOrderDiscount: number;
  TotalAmount: number;
  TaxAmount1!: number;
  TaxAmount2!: number;
  TaxAmount3!: number;
  TaxAmount!: number;
  TaxGroup: any;
  IsTaxInclusive: boolean;
  Product: string;
  showname!: string;
  isorderitem: boolean;
  kotquantity: number;
  baseprice!: number;
  kotrefid!: string;
  refid!: string;
  constructor(product: any) {
    this.Id = 0;
    this.CategoryId = product.CategoryId;
    this.ComplementryQty = 0;
    this.MinimumQty = product.MinimumQty;
    this.DiscAmount = product.DiscAmount ? product.DiscAmount : null;
    this.DiscPercent = product.DiscPercent ? product.DiscPercent : null;
    this.DiscType = product.DiscType ? product.DiscType : 1;
    this.Extra = 0;
    this.FreeQtyPercentage = product.FreeQtyPercentage;
    this.ItemDiscount = 0;
    this.KitchenUserId = null;
    this.KOTGroupId = product.KOTGroupId ? product.KOTGroupId : 0;
    this.KOTId = 0;
    this.Message = '';
    this.MinimumQty = product.MinimumQty;
    this.Name = product.Name;
    this.Product = product.Name;
    this.Note = null;
    this.OptionJson = '';
    this.OptionGroup = [];
    this.OrderDiscount = 0;
    this.OrderId = 0;
    this.ProductId = product.Id > 0 ? product.Id : product.ProductId;
    this.ProductKey = product.ProductKey ? product.ProductKey : '';
    this.Price = product.Price;
    this.Quantity = product.Quantity ? product.Quantity : 1;
    this.StatusId = 0;
    if (product.TaxGroup) {
      this.TaxGroup = product.TaxGroup;
      this.Tax1 = product.TaxGroup.Tax1;
      this.Tax2 = product.TaxGroup.Tax2;
      this.Tax3 = product.TaxGroup.Tax3;
    } else {
      this.Tax1 = product.Tax1;
      this.Tax2 = product.Tax2;
      this.Tax3 = product.Tax3;
    }
    this.TaxGroupId = product.TaxGroupId;
    this.TaxItemDiscount = 0;
    this.TaxOrderDiscount = 0;
    this.TotalAmount = 0;
    this.kotquantity = 0;
    this.isorderitem = product.isorderitem ? true : false;
    this.IsTaxInclusive = product.IsTaxInclusive;
    if (this.Quantity >= this.MinimumQty) {
      this.ComplementryQty = (this.Quantity * this.FreeQtyPercentage) / 100;
    }
    if (product.OptionGroup) {
      product.OptionGroup.forEach((opg: any) => {
        if (opg.OptionGroupType == 1) {
          opg.selected = true;
          if (!opg.Option.some((x: any) => x.selected == true)) {
            opg.Option[0].selected = true;
            opg.selected = opg.Option[0].Id;
          }
        }
        if (opg.OptionGroupType == 2 && !this.isorderitem) {
          opg.Option.forEach((option: any) => {
            option.selected = false;
          });
        }
        this.OptionGroup.push(opg);
      });
      product.OptionGroup.forEach((opg: any) => {
        if (opg.selected) {
          opg.Option.forEach((option: any) => {
            if (option.selected) {
              this.TotalAmount += option.Price;
            }
          });
        }
      });
    }
    this.TotalAmount += this.Price;
    this.TotalAmount *= this.Quantity;
    if (this.DiscType == 1) {
      this.TotalAmount -= this.DiscAmount;
    } else if (this.DiscType == 2) {
      this.TotalAmount -= (this.TotalAmount * this.DiscPercent) / 100;
    }
  }
}
export class CustomerModule {
  Id: number | null;
  Name: string;
  Email: string;
  PhoneNo: string;
  Address: string;
  City: string;
  PostalCode: number | null;
  googlemapurl: string;
  CompanyId: number;
  StoreId: number;
  Sync: number;
  val!: number;
  constructor() {
    this.Id = null;
    this.Name = '';
    this.Email = '';
    this.PhoneNo = '';
    this.Address = '';
    this.City = '';
    this.PostalCode = null;
    this.googlemapurl = '';
    this.CompanyId = 0;
    this.StoreId = 0;
    this.Sync = 0;
  }
}
export class Transaction {
  Id!: number;
  Amount: number;
  OrderId: number;
  CustomerId!: number;
  PaymentTypeId: number;
  StorePaymentTypeId: number;
  TranstypeId!: number;
  PaymentStatusId!: number;
  TransDateTime!: string;
  TransDate!: string;
  UserId!: number;
  CompanyId!: number;
  StoreId!: number;
  Notes: string;
  Remaining!: number;
  InvoiceNo: string;
  StorePaymentTypeName: string;
  saved: boolean = false;
  constructor() {
    this.Amount = 0;
    this.OrderId = 0;
    this.PaymentTypeId = 6;
    this.StorePaymentTypeId = 0;
    this.Notes = '';
    this.InvoiceNo = '';
    this.StorePaymentTypeName = '';
  }
}
export class AdditionalCharge {
  Id: number;
  Amount: number;
  ChargeType: number;
  ChargeValue: number;
  Description: string;
  TaxGroupId: number;
  selected: boolean;
  constructor(charge: any) {
    this.Id = charge.Id;
    this.Amount = 0;
    this.ChargeType = charge.ChargeType;
    this.ChargeValue = charge.ChargeValue;
    this.Description = charge.Description;
    this.TaxGroupId = charge.TaxGroupId;
    this.selected = charge.selected;
  }
}

// ChargeType: 2
// ChargeValue: 20
// Description: "Delivery Charge"
// Id: 6
// TaxGroupId: 8

interface Tag2 {
  id: number;
  is_system: boolean;
  title: string;
}

interface Tag {
  group: string;
  is_system: boolean;
  tags: Tag2[];
}

interface Tax {
  rate: number;
  liability_on: string;
  value: number;
  title: string;
}

interface Item {
  image_url: string;
  total: number;
  title: string;
  charges: any[];
  total_with_tax: number;
  price: number;
  tags: Tag[];
  translations?: any;
  unit_weight: number;
  discount: number;
  instructions?: any;
  image_landscape_url?: any;
  taxes: Tax[];
  options_to_remove: any[];
  food_type: string;
  merchant_id: string;
  options_to_add: any[];
  id: number;
  quantity: number;
  refid: string;
  KOTGroupId: number;
}
