import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeborderRptComponent } from './weborder-rpt.component';

describe('WeborderRptComponent', () => {
  let component: WeborderRptComponent;
  let fixture: ComponentFixture<WeborderRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeborderRptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeborderRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
