import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutsService } from '@domain/workouts/services/workouts.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    WorkoutsService
  ]
})
export class WorkoutsDomainModule { }
