import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelOrdReportComponent } from './cancel-ord-report.component';

describe('CancelOrdReportComponent', () => {
  let component: CancelOrdReportComponent;
  let fixture: ComponentFixture<CancelOrdReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelOrdReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelOrdReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
