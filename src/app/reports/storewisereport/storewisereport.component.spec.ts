import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorewisereportComponent } from './storewisereport.component';

describe('StorewisereportComponent', () => {
  let component: StorewisereportComponent;
  let fixture: ComponentFixture<StorewisereportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StorewisereportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StorewisereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
