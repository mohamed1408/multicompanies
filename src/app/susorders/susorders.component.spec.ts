import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SusordersComponent } from './susorders.component';

describe('SusordersComponent', () => {
  let component: SusordersComponent;
  let fixture: ComponentFixture<SusordersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SusordersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SusordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
