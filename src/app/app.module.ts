import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { AutocompleteLibModule } from "angular-ng-autocomplete";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SigninComponent } from './signin/signin.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { HeaderComponent } from './header/header.component';
import { StorewiseComponent } from './storewise/storewise.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ProductsComponent } from './products/products.component';
import { EnquiryordersComponent } from './enquiryorders/enquiryorders.component';
import { OrderwisereportComponent } from './reports/orderwisereport/orderwisereport.component';
import { ProductwisereportComponent } from './reports/productwisereport/productwisereport.component';
import { CategorywisereportComponent } from './reports/categorywisereport/categorywisereport.component';
import { StorewisereportComponent } from './reports/storewisereport/storewisereport.component';
import { TimewisereportComponent } from './reports/timewisereport/timewisereport.component';
import { TimePipe } from './pipes/time/time.pipe';
import { MonthwiseproductreportComponent } from './reports/monthwiseproductreport/monthwiseproductreport.component';
import { SpgwisereportComponent } from './reports/spgwisereport/spgwisereport.component';
import { DeliveryorderreportComponent } from './reports/deliveryorderreport/deliveryorderreport.component';
import { ClickOutsideDirective } from './Directives/click-outside.directive';
import { SusordersComponent } from './susorders/susorders.component';
import { CancelOrdReportComponent } from './reports/cancel-ord-report/cancel-ord-report.component';
import { ProductsalesreportComponent } from './productsalesreport/productsalesreport.component';
import { VersionlistComponent } from './reports/versionlist/versionlist.component';
import { CustomerdatarptComponent } from './reports/customerdatarpt/customerdatarpt.component';

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    LockscreenComponent,
    HeaderComponent,
    StorewiseComponent,
    ProductsComponent,
    EnquiryordersComponent,
    OrderwisereportComponent,
    ProductwisereportComponent,
    CategorywisereportComponent,
    StorewisereportComponent,
    TimewisereportComponent,
    TimePipe,
    MonthwiseproductreportComponent,
    SpgwisereportComponent,
    DeliveryorderreportComponent,
    ClickOutsideDirective,
    SusordersComponent,
    CancelOrdReportComponent,
    ProductsalesreportComponent,
    VersionlistComponent,
    CustomerdatarptComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    Ng2SearchPipeModule,
    AutocompleteLibModule,
    ReactiveFormsModule,
    NgxDaterangepickerMd.forRoot(),
  ],
  providers: [
    JwtHelperService,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
  ],
  bootstrap: [AppComponent],
})

export class AppModule {
  ngDoBootstrap() {}
}