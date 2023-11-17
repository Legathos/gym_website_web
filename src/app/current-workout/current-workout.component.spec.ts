import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentWorkoutComponent } from './current-workout.component';

describe('CurrentWorkoutComponent', () => {
  let component: CurrentWorkoutComponent;
  let fixture: ComponentFixture<CurrentWorkoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrentWorkoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CurrentWorkoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
