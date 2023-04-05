import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'order',
})
export class OrderPipe implements PipeTransform {
  transform(orders: any, showFutureOrders: boolean): any {
    orders = orders.filter(
      (x: { futureOrder: any }) => showFutureOrders || !x.futureOrder
    );
    // console.log(orders.length)
    return orders || [];
  }
}

@Pipe({
  name: 'orderfilter',
})
export class OrderfilterPipe implements PipeTransform {
  transform(orders: any[], ordertypeid?: number): any {
    console.log(ordertypeid);
    return orders
      ? orders.filter(
          (x) =>
            x.OrderTypeId == ordertypeid || ordertypeid == 0 || !ordertypeid
        )
      : [];
  }
}

@Pipe({
  name: 'ptypefilter',
})
export class PtypefilterPipe implements PipeTransform {
  transform(ptypes: any[], storeid: number): any {
    return ptypes ? ptypes.filter((x) => x.StoreId == storeid) : [];
  }
}

@Pipe({
  name: 'categoryfilter',
})
export class CategoryPipe implements PipeTransform {
  transform(categories: any[], pcatid: number): any {
    return categories
      ? categories.filter((x) => x.ParentCategoryId == pcatid)
      : [];
  }
}

@Pipe({
  name: 'ctgreportpipe',
})
export class CTGReportPipe implements PipeTransform {
  transform(report: any[], catid: number, merge: boolean): any {
    let _report: any[] = [];
    console.log(report, catid)
    if (report) {
      report = report.filter(x => x.CategoryId == catid || catid == 0)
      if (merge) {
        report.forEach((rpt) => {
          // console.log("category: ", rpt.Category)
          if (_report.some((x) => x.CategoryId == rpt.CategoryId)) {
            _report.filter((x) => x.CategoryId == rpt.CategoryId)[0].TotalSales += rpt.TotalSales
          } else {
            // console.log("new category: ", rpt.Category)
            _report.push({ ...rpt, Store: '' });
          }
        });
      } else {
        _report = report
      }
    }
    return _report;
  }
}
