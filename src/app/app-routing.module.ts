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
import { OrderManagerComponent } from './order-manager/order-manager.component';
import { AuthGuardService } from './auth-guard.service';

const routes: Routes = [
  { path: '', component: SigninComponent, canActivate: [AuthGuardService], data: {role: ['all',]} },
  { path: 'lock', component: LockscreenComponent, canActivate: [AuthGuardService], data: {role: ['all']} },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'maintenance', component: StorewiseComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'm1', component: EnquiryordersComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'r1', component: OrderWiseComponent, canActivate: [AuthGuardService], data: {role: ['admin']} }, // old component: [OrderwisereportComponent]
  { path: 'r2', component: ProductwisereportComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'r3', component: CategorywisereportComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'r4', component: StorewisereportComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'r5', component: TimewisereportComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  {
    path: 'r6',
    component: MonthwiseproductreportComponent,
  },
  { path: 'r7', component: SpgwisereportComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'r8', component: DeliveryorderreportComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'm3', component: SusordersComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'r9', component: CancelOrdReportComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'r10', component: ProductsalesreportComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'r11', component: CustomerdatarptComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'r12', component: VersionlistComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'm2', component: DenominationComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'kb2chef', component: Kb2chefComponent, canActivate: [AuthGuardService], data: {role: ['admin']} },
  { path: 'u1', component: TransactionListComponent, canActivate: [AuthGuardService], data: {role: ['admin', 'cashier']} },
  { path: 'u2', component: OrderManagerComponent, canActivate: [AuthGuardService], data: {role: ['admin', 'cashier']} },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
