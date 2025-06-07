import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLogItemComponent } from './view-log-item.component';

describe('ViewLogItemComponent', () => {
  let component: ViewLogItemComponent;
  let fixture: ComponentFixture<ViewLogItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewLogItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewLogItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
