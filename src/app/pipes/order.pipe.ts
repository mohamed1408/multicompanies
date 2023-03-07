import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'order'
})
export class OrderPipe implements PipeTransform {

  transform(orders: any, showFutureOrders: boolean): any {
    orders = orders.filter((x: { futureOrder: any; }) => showFutureOrders || !x.futureOrder)
    // console.log(orders.length)
    return orders || [];
  }

}

@Pipe({
  name: "orderfilter",
})
export class OrderfilterPipe implements PipeTransform {

  transform(orders: any[], ordertypeid?: number): any {
    console.log(ordertypeid)
    return orders ? orders.filter(
      (x) => x.OrderTypeId == ordertypeid || ordertypeid == 0 || !ordertypeid
    ) : [];
  }
}

@Pipe({
  name: "ptypefilter",
})
export class PtypefilterPipe implements PipeTransform {

  transform(ptypes: any[], storeid: number): any {

    return ptypes ? ptypes.filter(
      (x) => x.StoreId == storeid
    ) : [];
  }
}