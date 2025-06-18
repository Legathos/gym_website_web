import { Component, OnInit } from '@angular/core';
import { ExerciseData } from '@domain/workouts/model/exercise.model';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { WorkoutsService } from '@domain/workouts/services/workouts.service';

@Component({
  selector: 'app-exercise-library',
  templateUrl: './exercise-library.component.html',
  styleUrl: './exercise-library.component.scss'
})
export class ExerciseLibraryComponent implements OnInit {
  exercises: ExerciseData[] = [];
  filteredExercises: ExerciseData[] = [];
  searchTerm: string = '';
  sortOption: string = 'name';

  constructor(
    private router: Router,
    private location: Location,
    private workoutsService: WorkoutsService
  ) { }

  ngOnInit(): void {
    // Initialize filtered exercises with all exercises
    this.filteredExercises = [...this.exercises];
  }

  // Navigate back to previous page
  goBack(): void {
    this.location.back();
  }

  // Search exercises by name or description
  searchExercises(): void {
    if (!this.searchTerm.trim()) {
      this.filteredExercises = [...this.exercises];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredExercises = this.exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(term) ||
        exercise.description.toLowerCase().includes(term)
      );
    }
    this.sortExercises();
  }

  // Sort exercises based on selected option
  sortExercises(): void {
    switch (this.sortOption) {
      case 'name':
        this.filteredExercises.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'category':
        this.filteredExercises.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        this.filteredExercises.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  // Navigate to add exercise page or open modal
  addExercise(): void {
    // Implementation will be added later
  }
}
