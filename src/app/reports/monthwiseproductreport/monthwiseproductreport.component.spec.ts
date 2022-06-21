import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthwiseproductreportComponent } from './monthwiseproductreport.component';

describe('MonthwiseproductreportComponent', () => {
  let component: MonthwiseproductreportComponent;
  let fixture: ComponentFixture<MonthwiseproductreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthwiseproductreportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthwiseproductreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
