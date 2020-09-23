import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyModalComponent } from './daily-modal.component';

describe('DailyModalComponent', () => {
  let component: DailyModalComponent;
  let fixture: ComponentFixture<DailyModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
