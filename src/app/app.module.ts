import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SigninComponent } from './signin/signin.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { HeaderComponent } from './header/header.component';
import { StorewiseComponent } from './storewise/storewise.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ProductsComponent } from './products/products.component';
import { EnquiryordersComponent } from './enquiryorders/enquiryorders.component';

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    LockscreenComponent,
    HeaderComponent,
    StorewiseComponent,
    ProductsComponent,
    EnquiryordersComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    Ng2SearchPipeModule,
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
