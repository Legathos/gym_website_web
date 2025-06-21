import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemberService } from '@domain/member';
import { WorkoutsService } from '@domain/workouts/services/workouts.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { ExerciseData } from '@domain/workouts/model/exercise.model';
import { SetTrackingData } from '@domain/workouts/model/set-tracking.model';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-current-workout',
  templateUrl: './current-workout.component.html',
  styleUrl: './current-workout.component.scss'
})
export class CurrentWorkoutComponent implements OnInit {
  workoutName: string = '';
  workoutExercises: ExerciseData[] = [];
  // Map to store sets for each exercise (key: exercise_id, value: array of sets)
  exerciseSets: Map<number, SetTrackingData[]> = new Map();

  /**
   * Constructor - initializes the component and subscribes to workout data
   * @param router Angular router for navigation
   * @param memberService Service for member-related operations
   * @param workoutsService Service for workout-related operations
   * @param dialog Material dialog service for displaying dialogs
   */
  constructor(
    private router: Router,
    private memberService: MemberService,
    private workoutsService: WorkoutsService,
    private dialog: MatDialog
  ) {
    // First subscribe to changes in the current workout sets
    this.workoutsService.getCurrentWorkoutSets().subscribe(sets => {
      this.exerciseSets = sets;
    });

    // Then subscribe to changes in the current workout exercises
    this.workoutsService.getCurrentWorkoutExercises().subscribe(exercises => {
      this.workoutExercises = exercises;

      // Initialize sets for new exercises and add a default set
      exercises.forEach(exercise => {
        if (exercise.id && !this.exerciseSets.has(exercise.id)) {
          // Add a default set for the new exercise
          this.addSet(exercise.id);
        }
      });
    });

    // Subscribe to changes in the current workout name
    this.workoutsService.getCurrentWorkoutName().subscribe(name => {
      this.workoutName = name;
    });
  }

  /**
   * Angular lifecycle hook - called after component initialization
   */
  ngOnInit(): void {
    // Component is initialized in the constructor
  }

  /**
   * Navigates back to the workouts page
   */
  goBack(): void {
    this.memberService.getUserId().subscribe(userId => {
      this.router.navigate(['/workouts', userId]);
    });
  }

  /**
   * Validates if the workout can be finished
   * @returns boolean indicating if the workout is valid
   */
  private validateWorkout(): boolean {
    // Check if workout name is provided
    if (!this.workoutName.trim()) {
      this.showDialog('Please enter a workout name before finishing.');
      return false;
    }

    // Check if there are any exercises in the workout
    if (this.workoutExercises.length === 0) {
      this.showDialog('Please add at least one exercise to your workout before finishing.');
      return false;
    }

    // Check if there are any sets with actual data (non-zero reps and weight)
    let hasValidSets = false;
    for (const sets of this.exerciseSets.values()) {
      if (sets.some(set => set.reps > 0 && set.weight > 0)) {
        hasValidSets = true;
        break;
      }
    }

    if (!hasValidSets) {
      this.showDialog('Please add at least one set with non-zero reps and weight before finishing.');
      return false;
    }

    return true;
  }

  /**
   * Shows a dialog with the given message
   * @param message The message to display
   * @param action The action button text (default: 'OK')
   * @param panelClass Optional CSS class to apply to the dialog
   * @returns Observable of the dialog result
   */
  private showDialog(message: string, action: string = 'OK', panelClass?: string) {
    return this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        question: message,
        action: action
      },
      panelClass: panelClass
    });
  }

  /**
   * Extracts the workout ID from the response
   * @param response The response from the server
   * @returns The workout ID
   */
  private extractWorkoutId(response: any): number {
    // If response is a string (JSON), try to parse it
    if (typeof response === 'string') {
      try {
        const parsedResponse = JSON.parse(response);

        // Check for ID in various possible properties
        if (parsedResponse.id !== undefined) {
          return parsedResponse.id;
        } else if (parsedResponse.workoutId !== undefined) {
          return parsedResponse.workoutId;
        } else if (parsedResponse.workout_id !== undefined) {
          return parsedResponse.workout_id;
        } else if (parsedResponse.data && parsedResponse.data.id !== undefined) {
          return parsedResponse.data.id;
        } else if (parsedResponse.body && parsedResponse.body.id !== undefined) {
          return parsedResponse.body.id;
        }
      } catch (e) {
        // Error parsing response, fall through to object check
      }
    } else if (typeof response === 'object' && response !== null) {
      // Check for ID in various possible properties of the object
      if (response.id !== undefined) {
        return response.id;
      } else if (response.workoutId !== undefined) {
        return response.workoutId;
      } else if (response.workout_id !== undefined) {
        return response.workout_id;
      } else if (response.data && response.data.id !== undefined) {
        return response.data.id;
      } else if (response.body && response.body.id !== undefined) {
        return response.body.id;
      }
    }

    // If no ID found, throw an error
    throw new Error('Could not extract workout ID from response');
  }

  /**
   * Prepares sets for saving by filtering and renumbering them
   * @param exerciseId The exercise ID
   * @param sets The sets to prepare
   * @param workoutId The workout ID
   * @returns The prepared sets
   */
  private prepareSetsForSaving(exerciseId: number, sets: SetTrackingData[], workoutId: number): SetTrackingData[] {
    // Filter out sets where both weight and reps are 0
    const filteredSets = sets.filter(set => !(set.weight === 0 && set.reps === 0));

    // Renumber sets for this exercise starting from 1
    return filteredSets.map((set, index) => ({
      ...set,
      workout_id: workoutId,
      set_id: index + 1
    }));
  }

  /**
   * Saves all sets for a workout
   * @param workoutId The workout ID
   * @returns Observable that completes when all sets are saved
   */
  private saveAllSets(workoutId: number): Observable<any[]> {
    const setObservables: Observable<any>[] = [];

    // Process each exercise's sets separately
    for (const [exerciseId, sets] of this.exerciseSets.entries()) {
      const preparedSets = this.prepareSetsForSaving(exerciseId, sets, workoutId);

      // Create an observable for each set
      for (const setData of preparedSets) {
        setObservables.push(this.workoutsService.addSetTracking(setData));
      }
    }

    // Return a forkJoin of all set observables
    return forkJoin(setObservables);
  }

  /**
   * Calculates the total weight for the workout
   * @returns The total weight
   */
  private calculateTotalWeight(): number {
    let totalWeight = 0;
    for (const exerciseId of this.exerciseSets.keys()) {
      const sets = this.exerciseSets.get(exerciseId) || [];
      for (const set of sets) {
        totalWeight += set.weight * set.reps;
      }
    }
    return totalWeight;
  }

  /**
   * Finishes the current workout
   */
  finishWorkout(): void {
    // Validate the workout
    if (!this.validateWorkout()) {
      return;
    }

    // Open confirmation dialog
    const dialogRef = this.showDialog(
      'Are you sure you want to finish this workout?',
      'Finish Workout',
      'workout-completion-dialog'
    );

    // Handle dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.memberService.getUserId().subscribe(userId => {
          // Calculate total weight
          const totalWeight = this.calculateTotalWeight();

          // Create workout data object
          const workoutData = {
            user_id: userId,
            name: this.workoutName,
            date: new Date(),
            total_weight: totalWeight,
            status: 'completed',
          };

          // Call the service to save the workout
          this.workoutsService.addWorkout(workoutData).subscribe({
            next: response => {
              try {
                // Extract the workout ID from the response
                const workoutId = this.extractWorkoutId(response);

                // Save all sets
                this.saveAllSets(workoutId).subscribe({
                  next: () => {
                    // Show success dialog
                    const successDialogRef = this.showDialog(
                      'Workout and all sets completed successfully!',
                      'OK',
                      'workout-completion-dialog'
                    );

                    // Navigate to workouts page after dialog is closed
                    successDialogRef.afterClosed().subscribe(() => {
                      // Clear the current workout exercises
                      this.workoutsService.clearCurrentWorkoutExercises();
                      this.router.navigate(['/workouts', userId]);
                    });
                  },
                  error: () => {
                    this.showDialog('Workout saved but there was an error saving some sets. Please try again.');
                  }
                });
              } catch (error) {
                this.showDialog('Error processing workout response. Please try again.');
              }
            },
            error: () => {
              // Show error dialog
              this.showDialog('Error saving workout. Please try again.');
            }
          });
        });
      }
    });
  }

  /**
   * Cancels the current workout
   */
  cancelWorkout(): void {
    // Open confirmation dialog
    const dialogRef = this.showDialog(
      'Are you sure you want to cancel this workout? All progress will be lost.',
      'Cancel Workout'
    );

    // Handle dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Clear the current workout exercises
        this.workoutsService.clearCurrentWorkoutExercises();

        this.memberService.getUserId().subscribe(userId => {
          this.router.navigate(['/workouts', userId]);
        });
      }
    });
  }

  /**
   * Navigates to the exercise library to add an exercise to the current workout
   */
  addExercise(): void {
    // Navigate to exercise library to select an exercise
    // Pass a query parameter to indicate that we're coming from the current workout
    this.router.navigate(['/exercise-library'], {
      queryParams: { fromCurrentWorkout: 'true' }
    });
  }

  /**
   * Removes an exercise from the current workout
   * @param exercise The exercise to remove
   */
  removeExercise(exercise: ExerciseData): void {
    if (!exercise.id) {
      this.showDialog('Cannot remove exercise without ID');
      return;
    }

    // Open confirmation dialog
    const dialogRef = this.showDialog(
      `Are you sure you want to remove "${exercise.name}" from this workout?`,
      'Remove'
    );

    // Handle dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // The service will handle removing the exercise and its sets
        this.workoutsService.removeExerciseFromCurrentWorkout(exercise.id);
      }
    });
  }

  /**
   * Adds a new set to an exercise
   * @param exerciseId The ID of the exercise to add a set to
   */
  addSet(exerciseId: number): void {
    const sets = this.exerciseSets.get(exerciseId) || [];
    const newSetId = sets.length > 0 ? Math.max(...sets.map(s => s.set_id)) + 1 : 1;

    const newSet: SetTrackingData = {
      exercise_id: exerciseId,
      workout_id: 0, // This will be set when the workout is saved
      set_id: newSetId,
      reps: 0,
      weight: 0
    };

    // Use the service to add the set
    // The service will handle renumbering the sets
    this.workoutsService.addSetToCurrentWorkout(exerciseId, newSet);
  }

  /**
   * Updates a set's weight or reps
   * @param exerciseId The ID of the exercise the set belongs to
   * @param setId The ID of the set to update
   * @param field The field to update ('weight' or 'reps')
   * @param value The new value for the field
   */
  updateSet(exerciseId: number, setId: number, field: 'weight' | 'reps', value: number): void {
    // Use the service to update the set field
    this.workoutsService.updateSetField(exerciseId, setId, field, value);
  }

  /**
   * Deletes a set from an exercise
   * @param exerciseId The ID of the exercise the set belongs to
   * @param setId The ID of the set to delete
   */
  deleteSet(exerciseId: number, setId: number): void {
    // Use the service to remove the set
    // The service will handle renumbering the sets
    this.workoutsService.removeSetFromCurrentWorkout(exerciseId, setId);
  }

  /**
   * Updates the workout name
   * @param name The new workout name
   */
  updateWorkoutName(name: string): void {
    // Use the service to update the workout name
    this.workoutsService.setCurrentWorkoutName(name);
  }

}
