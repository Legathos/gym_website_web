import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutsService } from '@domain/workouts/services/workouts.service';
import { WorkoutsData } from '@domain/workouts/model/workouts.model';
import { ExerciseData } from '@domain/workouts/model/exercise.model';
import { SetTrackingData } from '@domain/workouts/model/set-tracking.model';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-view-workout',
  templateUrl: './view-workout.component.html',
  styleUrl: './view-workout.component.scss'
})
export class ViewWorkoutComponent implements OnInit {
  workout: WorkoutsData | null = null;
  exercises: ExerciseData[] = [];
  sets: Map<number, SetTrackingData[]> = new Map<number, SetTrackingData[]>();
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutsService: WorkoutsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadWorkout(+id);
      } else {
        this.error = 'Workout ID not found';
        this.loading = false;
      }
    });
  }

  loadWorkout(id: number): void {
    this.loading = true;
    this.error = null;

    this.workoutsService.getWorkout(id)
      .subscribe({
        next: (workout) => {
          this.workout = workout;
          this.loadExercisesAndSets(workout.id!);
        },
        error: (err) => {
          console.error('Error loading workout:', err);
          this.error = 'Failed to load workout. Please try again.';
          this.loading = false;
        }
      });
  }

  loadExercisesAndSets(workoutId: number): void {
    // Get all sets for this workout
    this.workoutsService.getSetsByWorkoutId(workoutId)
      .subscribe({
        next: (sets) => {
          if (sets && sets.length > 0) {
            // Extract unique exercise IDs from the sets
            const exerciseIds = [...new Set(sets.map(set => set.exercise_id))];

            // Create a map to store sets by exercise ID
            const setsByExercise = new Map<number, SetTrackingData[]>();

            // Group sets by exercise ID
            exerciseIds.forEach(exerciseId => {
              const exerciseSets = sets.filter(set => set.exercise_id === exerciseId);
              // Sort sets by set_id
              exerciseSets.sort((a, b) => a.set_id - b.set_id);
              setsByExercise.set(exerciseId, exerciseSets);
            });

            // Store the sets
            this.sets = setsByExercise;

            // Load exercise details for each exercise ID
            this.loadExerciseDetails(exerciseIds);
          } else {
            // No sets found, finish loading
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error loading sets:', err);
          this.error = 'Failed to load workout sets. Please try again.';
          this.loading = false;
        }
      });
  }

  loadExerciseDetails(exerciseIds: number[]): void {
    // Create an array of observables for each exercise
    const exerciseObservables = exerciseIds.map(exerciseId =>
      this.workoutsService.getExerciseById(exerciseId)
    );

    // If there are no exercises, finish loading
    if (exerciseObservables.length === 0) {
      this.loading = false;
      return;
    }

    // Execute all observables in parallel
    forkJoin(exerciseObservables)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (exercises) => {
          // Add all exercises to our list
          this.exercises = exercises;

          // Sort exercises by name or another property if needed
          this.exercises.sort((a, b) => a.name.localeCompare(b.name));
        },
        error: (err) => {
          console.error('Error loading exercise details:', err);
          this.error = 'Failed to load exercise details. Please try again.';
        }
      });
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/view-workout-list']);
  }
}
