import { Component, OnInit } from '@angular/core';
import { ExerciseData } from '@domain/workouts/model/exercise.model';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { WorkoutsService } from '@domain/workouts/services/workouts.service';
import { finalize } from 'rxjs/operators';
import { MemberService } from '@domain/member';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';

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
  isDeleting: boolean = false;

  constructor(
    private router: Router,
    private location: Location,
    private workoutsService: WorkoutsService,
    private memberService: MemberService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Subscribe to exercises from the service
    this.workoutsService.getExercises().subscribe(exercises => {
      this.exercises = exercises;
      this.filteredExercises = [...this.exercises];
      this.sortExercises();
    });
  }

  // Navigate back to workouts page
  goBack(): void {
    this.memberService.getUserId().subscribe(userId => {
      this.router.navigate(['/workouts', userId]);
    });
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

  // Navigate to add exercise page
  addExercise(): void {
    this.router.navigate(['/add-exercise']);
  }


  // Delete exercise after confirmation
  deleteExercise(exercise: ExerciseData): void {
    if (!exercise.id) {
      console.error('Cannot delete exercise without ID');
      return;
    }

    // Open confirmation dialog
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        question: `Are you sure you want to delete "${exercise.name}"?`,
        action: 'Delete'
      }
    });

    // Handle dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isDeleting = true;

        this.workoutsService.deleteExercise(exercise.id)
          .pipe(finalize(() => this.isDeleting = false))
          .subscribe({
            next: () => {
              // Success message could be shown here
              console.log(`Exercise "${exercise.name}" deleted successfully`);
            },
            error: (error) => {
              console.error('Error deleting exercise:', error);
              // Error message could be shown here
              alert('Failed to delete exercise. Please try again.');
            }
          });
      }
    });
  }
}
