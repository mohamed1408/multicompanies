import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnquiryordersComponent } from './enquiryorders/enquiryorders.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { ProductsComponent } from './products/products.component';
import { ProductsalesreportComponent } from './productsalesreport/productsalesreport.component';
import { CancelOrdReportComponent } from './reports/cancel-ord-report/cancel-ord-report.component';
import { CategorywisereportComponent } from './reports/categorywisereport/categorywisereport.component';
import { CustomerdatarptComponent } from './reports/customerdatarpt/customerdatarpt.component';
import { DeliveryorderreportComponent } from './reports/deliveryorderreport/deliveryorderreport.component';
import { MonthwiseproductreportComponent } from './reports/monthwiseproductreport/monthwiseproductreport.component';
import { OrderwisereportComponent } from './reports/orderwisereport/orderwisereport.component';
import { ProductwisereportComponent } from './reports/productwisereport/productwisereport.component';
import { SpgwisereportComponent } from './reports/spgwisereport/spgwisereport.component';
import { StorewisereportComponent } from './reports/storewisereport/storewisereport.component';
import { TimewisereportComponent } from './reports/timewisereport/timewisereport.component';
import { VersionlistComponent } from './reports/versionlist/versionlist.component';
import { SigninComponent } from './signin/signin.component';
import { StorewiseComponent } from './storewise/storewise.component';
import { SusordersComponent } from './susorders/susorders.component';
import { DenominationComponent } from './denomination/denomination.component';
import { Kb2chefComponent } from './reports/kb2chef/kb2chef.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { OrderWiseComponent } from './reports/order-wise/order-wise.component';

const routes: Routes = [
  { path: '', component: SigninComponent },
  { path: 'lock', component: LockscreenComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'maintenance', component: StorewiseComponent },
  { path: 'm1', component: EnquiryordersComponent },
  { path: 'r1', component: OrderWiseComponent }, // old component: [OrderwisereportComponent]
  { path: 'r2', component: ProductwisereportComponent },
  { path: 'r3', component: CategorywisereportComponent },
  { path: 'r4', component: StorewisereportComponent },
  { path: 'r5', component: TimewisereportComponent },
  {
    path: 'r6',
    component: MonthwiseproductreportComponent,
  },
  { path: 'r7', component: SpgwisereportComponent },
  { path: 'r8', component: DeliveryorderreportComponent },
  { path: 'm3', component: SusordersComponent },
  { path: 'r9', component: CancelOrdReportComponent },
  { path: 'r10', component: ProductsalesreportComponent },
  { path: 'r11', component: CustomerdatarptComponent },
  { path: 'r12', component: VersionlistComponent },
  { path: 'm2', component: DenominationComponent },
  { path: 'kb2chef', component: Kb2chefComponent },
  { path: 't1', component: TransactionListComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
