import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SptRptComponent } from './spt-rpt.component';

describe('SptRptComponent', () => {
  let component: SptRptComponent;
  let fixture: ComponentFixture<SptRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SptRptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SptRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
