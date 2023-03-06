import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerdatarptComponent } from './customerdatarpt.component';

describe('CustomerdatarptComponent', () => {
  let component: CustomerdatarptComponent;
  let fixture: ComponentFixture<CustomerdatarptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerdatarptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerdatarptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
