import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { WorkoutsService } from '@domain/workouts/services/workouts.service';
import { ExerciseData } from '@domain/workouts/model/exercise.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-add-exercise',
  templateUrl: './add-exercise.component.html',
  styleUrl: './add-exercise.component.scss'
})
export class AddExerciseComponent implements OnInit {
  exerciseForm: FormGroup;
  categories: string[] = [];
  isLoading = false;
  errorMessage = '';
  pageTitle = 'Add Exercise';
  fromCurrentWorkout = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private workoutsService: WorkoutsService
  ) {
    this.exerciseForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.categories = this.workoutsService.getExerciseCategories();

    // Check if we're coming from the current workout page via exercise library
    this.route.queryParams.subscribe(params => {
      this.fromCurrentWorkout = params['fromCurrentWorkout'] === 'true';
    });
  }

  goBack(): void {
    // Instead of using location.back(), navigate to exercise library with the fromCurrentWorkout parameter
    // This ensures the parameter is preserved even when using the back button
    this.router.navigate(['/exercise-library'], {
      queryParams: { fromCurrentWorkout: this.fromCurrentWorkout ? 'true' : 'false' }
    });
  }

  onSubmit(): void {
    if (this.exerciseForm.valid) {
      // Reset error message
      this.errorMessage = '';
      // Set loading state
      this.isLoading = true;

      const exerciseData: ExerciseData = this.exerciseForm.value;

      // Add new exercise
      this.workoutsService.addExercise(exerciseData)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (response) => {
            console.log('Exercise added successfully:', response);
            // Navigate back to the exercise library, preserving the fromCurrentWorkout parameter
            this.router.navigate(['/exercise-library'], {
              queryParams: { fromCurrentWorkout: this.fromCurrentWorkout ? 'true' : 'false' }
            });
          },
          error: (error) => {
            console.error('Error adding exercise:', error);
            this.errorMessage = error.message || 'Failed to add exercise. Please try again.';
          }
        });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.exerciseForm.controls).forEach(key => {
        const control = this.exerciseForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
