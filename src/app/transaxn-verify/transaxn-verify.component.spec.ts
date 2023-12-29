import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransaxnVerifyComponent } from './transaxn-verify.component';

describe('TransaxnVerifyComponent', () => {
  let component: TransaxnVerifyComponent;
  let fixture: ComponentFixture<TransaxnVerifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransaxnVerifyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransaxnVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
