import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWorkoutListComponent } from './view-workout-list.component';

describe('ViewWorkoutListComponent', () => {
  let component: ViewWorkoutListComponent;
  let fixture: ComponentFixture<ViewWorkoutListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewWorkoutListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewWorkoutListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
