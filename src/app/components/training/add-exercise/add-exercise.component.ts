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
  }

  goBack(): void {
    this.location.back();
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
            // Navigate back to the exercise library
            this.router.navigate(['/exercise-library']);
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
