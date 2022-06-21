import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpgwisereportComponent } from './spgwisereport.component';

describe('SpgwisereportComponent', () => {
  let component: SpgwisereportComponent;
  let fixture: ComponentFixture<SpgwisereportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpgwisereportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpgwisereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
