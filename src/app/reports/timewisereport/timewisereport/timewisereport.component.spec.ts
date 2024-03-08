import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimewisereportComponent } from './timewisereport.component';

describe('TimewisereportComponent', () => {
  let component: TimewisereportComponent;
  let fixture: ComponentFixture<TimewisereportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimewisereportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimewisereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
