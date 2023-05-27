import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DenominationComponent } from './denomination.component';

describe('DenominationComponent', () => {
  let component: DenominationComponent;
  let fixture: ComponentFixture<DenominationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DenominationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DenominationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
