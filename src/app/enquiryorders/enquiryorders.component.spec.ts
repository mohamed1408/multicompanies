import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryordersComponent } from './enquiryorders.component';

describe('EnquiryordersComponent', () => {
  let component: EnquiryordersComponent;
  let fixture: ComponentFixture<EnquiryordersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnquiryordersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnquiryordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
