import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductwisereportComponent } from './productwisereport.component';

describe('ProductwisereportComponent', () => {
  let component: ProductwisereportComponent;
  let fixture: ComponentFixture<ProductwisereportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductwisereportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductwisereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
