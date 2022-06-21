import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorywisereportComponent } from './categorywisereport.component';

describe('CategorywisereportComponent', () => {
  let component: CategorywisereportComponent;
  let fixture: ComponentFixture<CategorywisereportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategorywisereportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategorywisereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
