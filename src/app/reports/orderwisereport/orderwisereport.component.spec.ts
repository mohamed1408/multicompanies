import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderwisereportComponent } from './orderwisereport.component';

describe('OrderwisereportComponent', () => {
  let component: OrderwisereportComponent;
  let fixture: ComponentFixture<OrderwisereportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderwisereportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderwisereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
