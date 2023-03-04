import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsalesreportComponent } from './productsalesreport.component';

describe('ProductsalesreportComponent', () => {
  let component: ProductsalesreportComponent;
  let fixture: ComponentFixture<ProductsalesreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductsalesreportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsalesreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
