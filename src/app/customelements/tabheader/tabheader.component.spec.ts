import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabheaderComponent } from './tabheader.component';

describe('TabheaderComponent', () => {
  let component: TabheaderComponent;
  let fixture: ComponentFixture<TabheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabheaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
