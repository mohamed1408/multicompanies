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

const routes: Routes = [
  { path: '', component: SigninComponent },
  { path: 'lock', component: LockscreenComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'maintenance', component: StorewiseComponent },
  { path: 'enquiryorders', component: EnquiryordersComponent },
  { path: 'maintenance1', component: OrderwisereportComponent },
  { path: 'productwisereport', component: ProductwisereportComponent },
  { path: 'categorywisereport', component: CategorywisereportComponent },
  { path: 'storewisereportpd', component: StorewisereportComponent },
  { path: 'maintenance2', component: TimewisereportComponent },
  {
    path: 'monthwiseproductreport',
    component: MonthwiseproductreportComponent,
  },
  { path: 'spgwisereport', component: SpgwisereportComponent },
  { path: 'maintenance4', component: DeliveryorderreportComponent },
  { path: 'susorders', component: SusordersComponent },
  { path: 'cancelorderreport', component: CancelOrdReportComponent },
  { path: 'productsalesreport', component: ProductsalesreportComponent },
  { path: 'customerdatareport', component: CustomerdatarptComponent },
  { path: 'versionlistreport', component: VersionlistComponent },
  { path: 'maintenance3', component: DenominationComponent },
  { path: 'kb2chef', component: Kb2chefComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
