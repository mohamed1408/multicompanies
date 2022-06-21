import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryorderreportComponent } from './deliveryorderreport.component';

describe('DeliveryorderreportComponent', () => {
  let component: DeliveryorderreportComponent;
  let fixture: ComponentFixture<DeliveryorderreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryorderreportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryorderreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
