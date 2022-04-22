import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorewiseComponent } from './storewise.component';

describe('StorewiseComponent', () => {
  let component: StorewiseComponent;
  let fixture: ComponentFixture<StorewiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StorewiseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StorewiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
