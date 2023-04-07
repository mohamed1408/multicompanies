import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseurl = 'https://biz1pos.azurewebsites.net/api/';
  baseurl1 = 'https://localhost:44383/api/';
  ecomurl = 'https://biz1ecom.azurewebsites.net/api/';
  posurl = 'http://localhost:2357/';

  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  public accLocked: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    true
  );
  public isloading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  public showdropdown: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  public user: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public companies: BehaviorSubject<Array<any>> = new BehaviorSubject<
    Array<any>
  >([]);
  public selectedcompanies: BehaviorSubject<Array<number>> =
    new BehaviorSubject<Array<number>>([]);
  public companyid: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public limited_user: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    true
  );

  constructor(private router: Router, private http: HttpClient) {}

  toFormData(formValue: any) {
    const formData = new FormData();

    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      formData.append(key, value);
    }
    return formData;
  }

  logIn(formdata: any) {
    let body = this.toFormData(formdata);
    return this.http.post(this.baseurl + 'LogIn/WebLogIn', body);
  }

  unlock(pin: string, companyid: number) {
    return this.http.get(
      this.baseurl + `LogIn/pinlogin?companyid=${companyid}&pin=${pin}`
    );
  }

  // logIn() {
  //   this.loggedIn.next(true);
  //   this.router.navigate(['/home']);
  // }

  // logout() {
  //   this.loggedIn.next(false);
  //   this.router.navigate(['/']);
  // }

  userstores(userid: number) {
    return this.http.get(
      this.baseurl + `Dashboard/UserStores?userid=${userid}`
    );
  }

  dashboarddata(
    fromdate: string,
    todate: string,
    storeid: number,
    userid: number,
    companyid: number
  ) {
    return this.http.get(
      this.baseurl +
        `Dashboard/Dashboards?fromdate=${fromdate}&todate=${todate}&storeid=${storeid}&userid=${userid}&companyid=${companyid}`
    );
  }

  getusercompanies(userid: number) {
    return this.http.get(
      this.baseurl + `Dashboard/GetUserCompanies?userid=${userid}`
    );
  }

  GetStores(CompanyId: number) {
    var formURL = this.baseurl + 'Stores/Get?CompanyId=' + CompanyId;
    return this.http.get(formURL);
  }

  getdashboardbycompany(
    fromdate: string,
    totdate: string,
    companyid: number,
    storeid: number
  ) {
    return this.http.get(
      this.baseurl +
        `Dashboard/Post?fromDate=${fromdate}&toDate=${totdate}&compId=${companyid}&storeId=${storeid}`
    );
  }

  GetStorewiseRpt(frmdate: string, todate: string, compId: number) {
    return this.http.get(
      this.baseurl +
        'StoreRpt/GetStoreRpt?frmdate=' +
        frmdate +
        '&todate=' +
        todate +
        '&companyId=' +
        compId
    );
  }

  GetMultiStorewiseRpt(frmdate: string, todate: string, companykey: string) {
    return this.http.get(
      this.baseurl +
        'StoreRpt/GetMultiCompanyStoreRpt?frmdate=' +
        frmdate +
        '&todate=' +
        todate +
        '&companykey=' +
        companykey
    );
  }

  getCompanyProducts(companyid: number, storeid: number) {
    return this.http.get(
      this.baseurl +
        'Product/CompanyProducts?companyid=' +
        companyid +
        '&storeid=' +
        storeid
    );
  }

  getCompanySPG(companyid: number) {
    return this.http.get(
      this.baseurl + 'SaleProductGroup/GetSaleProducts?companyid=' + companyid
    );
  }

  getAllstores() {
    return this.http.get(this.ecomurl + 'Ecommerce/getallStores');
  }

  getCustomerByPhone(phonenum: string) {
    return this.http.get(
      this.baseurl + 'Customer/GetCustomerByPhone?Phone=' + phonenum
    );
  }

  saveorder(payload: any) {
    return this.http.post(this.baseurl + 'POSOrder/saveorder_3', payload);
  }

  getENQOrders(orderid?: number) {
    return this.http.get(
      this.baseurl + 'POSOrder/enquiryOrders?orderid=' + orderid
    );
  }

  // Report Functions
  // copied from [post.biz1book.com]

  GetSalesRpt1(
    Id: number,
    frmdate: string,
    todate: string,
    compId: number,
    sourceId: number,
    cancelOrder: number = 0
  ) {
    return this.http.get(
      this.baseurl +
        'OrderWise/GetRpt?frmdate=' +
        frmdate +
        '&todate=' +
        todate +
        '&Id=' +
        Id +
        '&compId=' +
        compId +
        '&sourceId=' +
        sourceId +
        '&cancelOrder=' +
        cancelOrder
    );
  }

  GetproductRpt(
    Id: number,
    frmdate: string,
    todate: string,
    compId: number,
    categoryId: number,
    sourcekey: string,
    tagId: number,
    datatype: number,
    storekey: string
  ) {
    return this.http.get(
      this.baseurl +
        'productwise/GetRpt?frmdate=' +
        frmdate +
        '&todate=' +
        todate +
        '&Id=' +
        Id +
        '&compId=' +
        compId +
        '&categoryId=' +
        categoryId +
        '&sourcekey=' +
        sourcekey +
        '&tagId=' +
        tagId +
        '&datatype=' +
        datatype +
        '&storekey=' +
        storekey
    );
  }

  GetOptions(companyid: number) {
    return this.http.get(
      this.baseurl + 'OptionGroup/GetOptions?companyid=' + companyid
    );
  }

  getSaleProducts(companyid: number) {
    return this.http.get(
      this.baseurl + 'SaleProductGroup/GetSaleProducts?companyid=' + companyid
    );
  }

  getlocalorders() {
    return this.http.post(this.posurl + 'getdbdata', [
      'tableorders',
      'loginfo',
    ]);
  }

  GetStoreName(CompanyId: number) {
    return this.http.get(this.baseurl + 'Stores/Get?CompanyId=' + CompanyId);
  }

  getTag(CompanyId: number) {
    return this.http.get(
      this.baseurl + 'TagMapping/GetTag?compId=' + CompanyId
    );
  }

  getcat(CompanyId: number) {
    return this.http.get(
      this.baseurl + 'Category/Index?CompanyId=' + CompanyId
    );
  }

  GetSalesRpt6(
    categoryId: string,
    frmdate: string,
    todate: string,
    CompanyId: number,
    sourceId: number,
    productId: string,
    tagId: number
  ) {
    return this.http.get(
      this.baseurl +
        'StorewiseRpt/GetStoreRpt?frmdate=' +
        frmdate +
        '&todate=' +
        todate +
        '&categoryId=' +
        categoryId +
        '&companyId=' +
        CompanyId +
        '&sourceId=' +
        sourceId +
        '&productId=' +
        productId +
        '&tagId=' +
        tagId
    );
  }

  GetSalesRpt5(
    Id: number,
    frmdate: string,
    todate: string,
    CompanyId: number,
    ParentCatId: number,
    sourcekey: string,
    store_key: string | null
  ) {
    return this.http.get(
      this.baseurl +
        'CategorywiseRpt/GetCategRpt?frmdate=' +
        frmdate +
        '&todate=' +
        todate +
        '&Id=' +
        Id +
        '&companyId=' +
        CompanyId +
        '&ParentCatId=' +
        ParentCatId +
        '&sourcekey=' +
        sourcekey +
        '&store_key=' +
        store_key
    );
  }

  Getprddata(
    Id: string,
    frmdate: string,
    todate: string,
    companyId: number,
    sourceId: number,
    categoryId: string,
    tagId: number
  ) {
    return this.http.get(
      this.baseurl +
        'StorewiseRpt/StorePrd?Id=' +
        Id +
        '&frmdate=' +
        frmdate +
        '&todate=' +
        todate +
        '&companyId=' +
        companyId +
        '&sourceId=' +
        sourceId +
        '&categoryId=' +
        categoryId +
        '&tagId=' +
        tagId
    );
  }

  getcatprd(CompanyId: number) {
    return this.http.get(
      this.baseurl + 'StorewiseRpt/GetProduct?CompanyId=' + CompanyId
    );
  }

  TimeSalesRpt(
    storeId: string,
    frmdate: string,
    todate: string,
    fromTime: string,
    toTime: string,
    interval: number,
    sourceId: number,
    productId: number,
    categoryId: string,
    saleproductgroupid: number,
    companyid: number
  ) {
    console.log(
      storeId,
      frmdate,
      todate,
      fromTime,
      toTime,
      interval,
      sourceId,
      productId,
      categoryId
    );
    return this.http.get(
      this.baseurl +
        'TimeWiseRpt/GetRpt?frmdate=' +
        frmdate +
        '&todate=' +
        todate +
        '&fromTime=' +
        fromTime +
        '&toTime=' +
        toTime +
        '&storeId=' +
        storeId +
        '&interval=' +
        interval +
        '&sourceId=' +
        sourceId +
        '&productId=' +
        productId +
        '&categoryId=' +
        categoryId +
        '&saleproductgroupid=' +
        saleproductgroupid +
        '&companyid=' +
        companyid
    );
  }

  gettimeprd(
    CompanyId: number,
    frmdate: string,
    todate: string,
    sourceId: number,
    storeId: string,
    starttime: string,
    endtime: string
  ) {
    return this.http.get(
      this.baseurl +
        'TimeWiseRpt/GetPrdRpt?frmDate=' +
        frmdate +
        '&todate=' +
        todate +
        '&CompanyId=' +
        CompanyId +
        '&sourceId=' +
        sourceId +
        '&storeId=' +
        storeId +
        '&fromTime=' +
        starttime +
        '&toTime=' +
        endtime
    );
  }

  getTimeWiseProducts(
    storeId: string,
    frmdate: string,
    todate: string,
    fromTime: string,
    toTime: string,
    sourceId: number,
    productId: number,
    saleproductgroupid: number,
    companyid: number
  ) {
    return this.http.get(
      this.baseurl +
        'TimeWiseRpt/GetReportProducts?frmdate=' +
        frmdate +
        '&todate=' +
        todate +
        '&fromTime=' +
        fromTime +
        '&toTime=' +
        toTime +
        '&storeId=' +
        storeId +
        '&sourceId=' +
        sourceId +
        '&productId=' +
        productId +
        '&saleproductgroupid=' +
        saleproductgroupid +
        '&companyid=' +
        companyid
    );
  }

  MonthSalesRpt(
    Id: string,
    frmdate: string,
    todate: string,
    sourceId: number,
    grpby: string,
    companyId: number,
    categoryId: number,
    productId: number
  ) {
    return this.http.get(
      this.baseurl +
        'Monthwise/GetRpt?frmdate=' +
        frmdate +
        '&todate=' +
        todate +
        '&companyId=' +
        companyId +
        '&groupBy=' +
        grpby +
        '&storeId=' +
        Id +
        '&sourceId=' +
        sourceId +
        '&categoryId=' +
        categoryId +
        '&productId=' +
        productId
    );
  }

  GetStoreName1(CompanyId: number) {
    return this.http.get(this.baseurl + 'Stores/Get?CompanyId=' + CompanyId);
  }

  GetSaleProdGroupRpt(
    Id: number,
    frmdate: string,
    todate: string,
    compId: number,
    sourceId: number,
    saleProdId: number
  ) {
    return this.http.get(
      this.baseurl +
        'SaleProductGroupwise/GetRpt?frmdate=' +
        frmdate +
        '&todate=' +
        todate +
        '&Id=' +
        Id +
        '&compId=' +
        compId +
        '&sourceId=' +
        sourceId +
        '&saleProdId=' +
        saleProdId
    );
  }

  GetStockPrdwise(
    frmdate: string,
    todate: string,
    saleProdId: number,
    compId: number,
    sourceId: number,
    storeId: number,
    type: number
  ) {
    return this.http.get(
      this.baseurl +
        'SaleProductGroupwise/GetStockPrdwise?frmdate=' +
        frmdate +
        '&todate=' +
        todate +
        '&saleProdId=' +
        saleProdId +
        '&compId=' +
        compId +
        '&sourceId=' +
        sourceId +
        '&storeId=' +
        storeId +
        '&type=' +
        type
    );
  }

  DeliveryOrderReport(
    storeid: number,
    companyid: number,
    fromdate: any,
    todate: any,
    invoiceno: string
  ) {
    return this.http.get(
      this.baseurl +
        `Report/DeliveryOrderReport?storeid=${storeid}&companyid=${companyid}&fromdate=${fromdate}&todate=${todate}&invoiceno=${invoiceno}`
    );
  }
  getSusOrders(companyid: number, storeid: number, from: string, to: string) {
    return this.http.get(
      this.baseurl +
        `Report/SusOrders?companyid=${companyid}&storeid=${storeid}&from=${from}&to=${to}`
    );
  }
  productsales(
    companyid: number,
    storeid: number,
    from: string,
    to: string,
    catgeoryid: number,
    ordertypeid: number
  ) {
    return this.http.get(
      this.baseurl +
        `Report/SalesByProducts?companyid=${companyid}&storeid=${storeid}&from=${from}&to=${to}&catgeoryid=${catgeoryid}&ordertypeid=${ordertypeid}`
    );
  }
  GetOrdRpt(
    frmdate: string,
    todate: string,
    CompanyId: string | number,
    sourceId: string | number,
    storeId: string | number
  ) {
    console.log(frmdate, todate, CompanyId, sourceId, storeId);
    var formURL = this.baseurl;
    var formURL =
      this.baseurl +
      'CancelordRpt/GetRpt?frmDate=' +
      frmdate +
      '&todate=' +
      todate +
      '&CompanyId=' +
      CompanyId +
      '&sourceId=' +
      sourceId +
      '&storeId=' +
      storeId;
    return this.http.get(formURL);
  }
  updateorder(payload: { OrderJson: string }) {
    return this.http.post(this.baseurl + 'POSOrder/updateorder_2', payload);
  }
  updateuporder(orderid: string, payload: any) {
    return this.http.post(
      this.baseurl + 'UrbanPiper/updateuporder?orderid=' + orderid,
      payload
    );
  }
  //MASTER 25-02-2023
  getCustListRpt(
    frmdate: string,
    todate: string,
    CompanyId: number,
    OrderTypeId: number,
    BillAmt : number
  ) {
    return this.http.get(
      this.baseurl +
        `Customer/GetCustomerList?companyid=${CompanyId}&frmdate=${frmdate}&todate=${todate}&ordertype=${OrderTypeId}&billamt=${BillAmt}`
    );
  }
  getAppVersion(CompanyId: number, OrderedDate: string) {
    return this.http.get(
      this.baseurl +
        `Electron/GetAppversion?companyid=${CompanyId}&orderdate=${OrderedDate}`
    );
  }

  getpendingorder(CompanyId: string | number, storeId: string | number) {
    return this.http.get(
      this.baseurl +
        'POSOrder/Getpendingorder?CompanyId=' +
        CompanyId +
        '&storeId=' +
        storeId
    );
  }
  getpaymenttypes(companyid: number, storeid: number) {
    return this.http.get(
      this.baseurl +
        'PaymentType/getpaymenttypes?companyid=' +
        companyid +
        '&storeid=' +
        storeid
    );
    // return this.http.get(this.baseurl + "PaymentType/getpaymenttypes?companyid=" + companyid + "&storeid=" + storeid);
  }
  getOrderId(orderid: string) {
    return this.http.get(
      this.baseurl + 'POSOrder/GetOrderId?orderid=' + orderid
    );
  }
  getTransactionId(orderid: string) {
    return this.http.get(
      this.baseurl + 'POSOrder/GetTransactionId?orderid=' + orderid
    );
  }
  completeOrders(payload: any) {
    return this.http.post(
      new BizUrl(this.baseurl, "POSOrder", "completePayment", {}).url,
      payload
    );
  }

}

// baseurl
class BizUrl {
  controller: string;
  method: string;
  params: any;
  url: string;
  constructor(baseUrl: string, controller: string, method: string, params: any) {
    this.controller = controller;
    this.method = method;
    this.params = params;
    this.url = baseUrl + controller + "/" + method + this.getParams();
  }
  getParams() {
    let paramStr = "?";
    Object.keys(this.params).forEach((key) => {
      paramStr += key + "=" + this.params[key] + "&";
    });
    return paramStr;
  }
}
