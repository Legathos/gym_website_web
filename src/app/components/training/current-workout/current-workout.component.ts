import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemberService } from '@domain/member';
import { WorkoutsService } from '@domain/workouts/services/workouts.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { ExerciseData } from '@domain/workouts/model/exercise.model';
import { SetTrackingData } from '@domain/workouts/model/set-tracking.model';

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

  constructor(
    private router: Router,
    private memberService: MemberService,
    private workoutsService: WorkoutsService,
    private dialog: MatDialog
  ) {
    // Subscribe to changes in the current workout exercises
    this.workoutsService.getCurrentWorkoutExercises().subscribe(exercises => {
      this.workoutExercises = exercises;

      // Initialize sets for new exercises and add a default set
      exercises.forEach(exercise => {
        if (exercise.id && !this.exerciseSets.has(exercise.id)) {
          this.exerciseSets.set(exercise.id, []);
          // Add a default set for the new exercise
          this.addSet(exercise.id);
        }
      });

      // Clean up sets for removed exercises
      const exerciseIds = new Set(exercises.map(e => e.id));
      for (const exerciseId of this.exerciseSets.keys()) {
        if (!exerciseIds.has(exerciseId)) {
          this.exerciseSets.delete(exerciseId);
        }
      }
    });
  }

  ngOnInit(): void {
    // Initialize component data
  }

  goBack(): void {
    this.memberService.getUserId().subscribe(userId => {
      this.router.navigate(['/workouts', userId]);
    });
  }

  finishWorkout(): void {
    // Check if workout name is provided
    if (!this.workoutName.trim()) {
      this.dialog.open(DialogComponent, {
        width: '350px',
        data: {
          question: 'Please enter a workout name before finishing.',
          action: 'OK'
        }
      });
      return;
    }

    // Check if there are any exercises in the workout
    if (this.workoutExercises.length === 0) {
      this.dialog.open(DialogComponent, {
        width: '350px',
        data: {
          question: 'Please add at least one exercise to your workout before finishing.',
          action: 'OK'
        }
      });
      return;
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
      this.dialog.open(DialogComponent, {
        width: '350px',
        data: {
          question: 'Please add at least one set with non-zero reps and weight before finishing.',
          action: 'OK'
        }
      });
      return;
    }

    // Open confirmation dialog
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        question: 'Are you sure you want to finish this workout?',
        action: 'Finish Workout'
      }
    });

    // Handle dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.memberService.getUserId().subscribe(userId => {
          // Calculate total weight and time (placeholder implementation)
          let totalWeight = 0;
          for (const exerciseId of this.exerciseSets.keys()) {
            const sets = this.exerciseSets.get(exerciseId) || [];
            for (const set of sets) {
              totalWeight += set.weight * set.reps;
            }
          }

          // Create workout data object
          const workoutData = {
            user_id: userId,
            name: this.workoutName,
            date: new Date(),
            total_weight: totalWeight,
            status: 'completed',
            // Sets will be saved separately
          };

          // Call the service to save the workout
          this.workoutsService.addWorkout(workoutData).subscribe(
            response => {
              console.log('Workout saved successfully:', response);
              console.log('Response type:', typeof response);

              // Get the workout ID from the response
              let workoutId: number | null = null;

              // If response is a string (JSON), try to parse it
              if (typeof response === 'string') {
                try {
                  const parsedResponse = JSON.parse(response);
                  console.log('Parsed response:', parsedResponse);

                  // Check for ID in various possible properties
                  if (parsedResponse.id !== undefined) {
                    workoutId = parsedResponse.id;
                  } else if (parsedResponse.workoutId !== undefined) {
                    workoutId = parsedResponse.workoutId;
                  } else if (parsedResponse.workout_id !== undefined) {
                    workoutId = parsedResponse.workout_id;
                  } else if (parsedResponse.data && parsedResponse.data.id !== undefined) {
                    workoutId = parsedResponse.data.id;
                  } else if (parsedResponse.body && parsedResponse.body.id !== undefined) {
                    workoutId = parsedResponse.body.id;
                  }

                  console.log('Parsed workoutId:', workoutId);
                } catch (e) {
                  console.error('Error parsing response:', e);
                }
              } else if (typeof response === 'object' && response !== null) {
                // Check for ID in various possible properties of the object
                if (response.id !== undefined) {
                  workoutId = response.id;
                } else if (response.workoutId !== undefined) {
                  workoutId = response.workoutId;
                } else if (response.workout_id !== undefined) {
                  workoutId = response.workout_id;
                } else if (response.data && response.data.id !== undefined) {
                  workoutId = response.data.id;
                } else if (response.body && response.body.id !== undefined) {
                  workoutId = response.body.id;
                }

                console.log('Object workoutId:', workoutId);
              }

              // Check if workoutId is null or undefined
              if (workoutId === null || workoutId === undefined) {
                console.error('Workout ID is null or undefined:', response);
                console.log('Generating a local workout ID as fallback');

                // Generate a unique ID as a fallback
                // Using current timestamp + random number to ensure uniqueness
                workoutId = Date.now() + Math.floor(Math.random() * 1000);
                console.log('Generated local workout ID:', workoutId);
              }

              // Group sets by exercise_id and ensure set_id starts from 1 for each exercise
              const setPromises: Promise<any>[] = [];

              // Process each exercise's sets separately
              for (const [exerciseId, sets] of this.exerciseSets.entries()) {
                // Renumber sets for this exercise starting from 1
                const renumberedSets = sets.map((set, index) => ({
                  ...set,
                  workout_id: workoutId as number, // Type assertion to ensure workout_id is a number
                  set_id: index + 1
                }));

                // Save each renumbered set
                renumberedSets.forEach(setWithWorkoutId => {
                  // Create a promise for each set save operation
                  const setPromise = new Promise<any>((resolve, reject) => {
                    this.workoutsService.addSetTracking(setWithWorkoutId).subscribe(
                      setResponse => {
                        console.log('Set saved successfully:', setResponse);
                        resolve(setResponse);
                      },
                      error => {
                        console.error('Error saving set:', error);
                        reject(error);
                      }
                    );
                  });

                  setPromises.push(setPromise);
                });
              }

              // Wait for all sets to be saved
              Promise.all(setPromises)
                .then(() => {
                  // Show success dialog
                  const successDialogRef = this.dialog.open(DialogComponent, {
                    width: '350px',
                    data: {
                      question: 'Workout and all sets completed successfully!',
                      action: 'OK'
                    }
                  });

                  // Navigate to workouts page after dialog is closed
                  successDialogRef.afterClosed().subscribe(() => {
                    // Clear the current workout exercises
                    this.workoutsService.clearCurrentWorkoutExercises();
                    this.router.navigate(['/workouts', userId]);
                  });
                })
                .catch(error => {
                  console.error('Error saving sets:', error);
                  this.dialog.open(DialogComponent, {
                    width: '350px',
                    data: {
                      question: 'Workout saved but there was an error saving some sets. Please try again.',
                      action: 'OK'
                    }
                  });
                });
            },
            error => {
              console.error('Error saving workout:', error);
              // Show error dialog instead of alert
              this.dialog.open(DialogComponent, {
                width: '350px',
                data: {
                  question: 'Error saving workout. Please try again.',
                  action: 'OK'
                }
              });
            }
          );
        });
      }
    });
  }

  cancelWorkout(): void {
    // Open confirmation dialog
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        question: 'Are you sure you want to cancel this workout? All progress will be lost.',
        action: 'Cancel Workout'
      }
    });

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

  addExercise(): void {
    // Navigate to exercise library to select an exercise
    // Pass a query parameter to indicate that we're coming from the current workout
    this.router.navigate(['/exercise-library'], {
      queryParams: { fromCurrentWorkout: 'true' }
    });
  }

  removeExercise(exercise: ExerciseData): void {
    if (!exercise.id) {
      console.error('Cannot remove exercise without ID');
      return;
    }

    // Open confirmation dialog
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        question: `Are you sure you want to remove "${exercise.name}" from this workout?`,
        action: 'Remove'
      }
    });

    // Handle dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workoutsService.removeExerciseFromCurrentWorkout(exercise.id);
        // Also remove any sets associated with this exercise
        this.exerciseSets.delete(exercise.id);
      }
    });
  }

  // Method to add a new set to an exercise
  addSet(exerciseId: number): void {
    if (!this.exerciseSets.has(exerciseId)) {
      this.exerciseSets.set(exerciseId, []);
    }

    const sets = this.exerciseSets.get(exerciseId) || [];
    const newSetId = sets.length > 0 ? Math.max(...sets.map(s => s.set_id)) + 1 : 1;

    const newSet: SetTrackingData = {
      exercise_id: exerciseId,
      workout_id: 0, // This will be set when the workout is saved
      set_id: newSetId,
      reps: 0,
      weight: 0
    };

    sets.push(newSet);
    this.exerciseSets.set(exerciseId, sets);
    this.renumberSets(exerciseId);
  }

  // Method to update a set's weight or reps
  updateSet(exerciseId: number, setId: number, field: 'weight' | 'reps', value: number): void {
    const sets = this.exerciseSets.get(exerciseId) || [];
    const setIndex = sets.findIndex(s => s.set_id === setId);

    if (setIndex !== -1) {
      sets[setIndex][field] = value;
      this.exerciseSets.set(exerciseId, sets);
    }
  }

  // Method to delete a set from an exercise
  deleteSet(exerciseId: number, setId: number): void {
    const sets = this.exerciseSets.get(exerciseId) || [];
    const updatedSets = sets.filter(s => s.set_id !== setId);
    this.exerciseSets.set(exerciseId, updatedSets);
    this.renumberSets(exerciseId);
  }

  // Method to renumber sets after deletion
  renumberSets(exerciseId: number): void {
    const sets = this.exerciseSets.get(exerciseId) || [];
    const renumberedSets = sets.map((set, index) => ({
      ...set,
      set_id: index + 1
    }));
    this.exerciseSets.set(exerciseId, renumberedSets);
  }
}
