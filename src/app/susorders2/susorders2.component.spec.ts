import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Susorders2Component } from './susorders2.component';

describe('Susorders2Component', () => {
  let component: Susorders2Component;
  let fixture: ComponentFixture<Susorders2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Susorders2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Susorders2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
