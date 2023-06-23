import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Kb2chefComponent } from './kb2chef.component';

describe('Kb2chefComponent', () => {
  let component: Kb2chefComponent;
  let fixture: ComponentFixture<Kb2chefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Kb2chefComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Kb2chefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
