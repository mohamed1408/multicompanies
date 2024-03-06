import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorywiseRptNewComponent } from './categorywise-rpt-new.component';

describe('CategorywiseRptNewComponent', () => {
  let component: CategorywiseRptNewComponent;
  let fixture: ComponentFixture<CategorywiseRptNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategorywiseRptNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategorywiseRptNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
