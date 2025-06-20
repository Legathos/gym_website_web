import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExerciseData } from '@domain/workouts/model/exercise.model';
import { SetTrackingData } from '@domain/workouts/model/set-tracking.model';
import { BehaviorSubject, Observable, tap, switchMap } from 'rxjs';
import { EndpointDictionary } from '../../../../environments/endpoint-dictionary';
import { MemberService } from '@domain/member';
import {WorkoutsData} from "@domain/workouts";
import { MonthlyWorkoutsData } from '@domain/workouts/model/monthly-workouts.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutsService {
  private exercises: ExerciseData[] = [];
  private exercisesSubject = new BehaviorSubject<ExerciseData[]>([]);

  // For managing exercises in the current workout
  private currentWorkoutExercises: ExerciseData[] = [];
  private currentWorkoutExercisesSubject = new BehaviorSubject<ExerciseData[]>([]);

  // For managing sets in the current workout
  private currentWorkoutSets: Map<number, SetTrackingData[]> = new Map<number, SetTrackingData[]>();
  private currentWorkoutSetsSubject = new BehaviorSubject<Map<number, SetTrackingData[]>>(new Map<number, SetTrackingData[]>());

  // For managing the current workout name
  private currentWorkoutName: string = '';
  private currentWorkoutNameSubject = new BehaviorSubject<string>('');

  constructor(
    private httpClient: HttpClient,
    private memberService: MemberService
  ) {
    // Load current workout exercises and sets from localStorage if available
    this.loadFromLocalStorage();
  }

  /**
   * Loads current workout data from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      // Load exercises
      const savedExercises = localStorage.getItem('currentWorkoutExercises');
      if (savedExercises) {
        this.currentWorkoutExercises = JSON.parse(savedExercises);
        this.currentWorkoutExercisesSubject.next(this.currentWorkoutExercises);
      }

      // Load sets
      const savedSets = localStorage.getItem('currentWorkoutSets');
      if (savedSets) {
        // Convert the JSON object back to a Map
        const setsObject = JSON.parse(savedSets);
        this.currentWorkoutSets = new Map();

        // Iterate through the object keys and set them in the Map
        Object.keys(setsObject).forEach(exerciseId => {
          this.currentWorkoutSets.set(Number(exerciseId), setsObject[exerciseId]);
        });

        this.currentWorkoutSetsSubject.next(this.currentWorkoutSets);
      }

      // Load workout name
      const savedWorkoutName = localStorage.getItem('currentWorkoutName');
      if (savedWorkoutName) {
        this.currentWorkoutName = savedWorkoutName;
        this.currentWorkoutNameSubject.next(this.currentWorkoutName);
      }
    } catch (error) {
      // If there's an error, initialize with empty data
      this.initializeEmptyWorkout();

      // Log a warning for debugging purposes
      console.warn('Failed to load workout data from localStorage. Initialized with empty data.');
    }
  }

  /**
   * Initializes an empty workout state
   */
  private initializeEmptyWorkout(): void {
    this.currentWorkoutExercises = [];
    this.currentWorkoutSets = new Map();
    this.currentWorkoutName = '';
    this.currentWorkoutExercisesSubject.next(this.currentWorkoutExercises);
    this.currentWorkoutSetsSubject.next(this.currentWorkoutSets);
    this.currentWorkoutNameSubject.next(this.currentWorkoutName);
  }

  /**
   * Saves current workout data to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      // Save exercises
      localStorage.setItem('currentWorkoutExercises', JSON.stringify(this.currentWorkoutExercises));

      // Convert Map to a regular object for JSON serialization
      const setsObject: { [key: string]: SetTrackingData[] } = {};
      this.currentWorkoutSets.forEach((value, key) => {
        setsObject[key.toString()] = value;
      });

      // Save sets
      localStorage.setItem('currentWorkoutSets', JSON.stringify(setsObject));

      // Save workout name
      localStorage.setItem('currentWorkoutName', this.currentWorkoutName);
    } catch (error) {
      // Log a warning for debugging purposes
      console.warn('Failed to save workout data to localStorage.');
    }
  }

  /**
   * Gets the current workout name as an observable
   * @returns Observable of the current workout name
   */
  getCurrentWorkoutName(): Observable<string> {
    return this.currentWorkoutNameSubject.asObservable();
  }

  /**
   * Sets the current workout name
   * @param name The new workout name
   */
  setCurrentWorkoutName(name: string): void {
    this.currentWorkoutName = name;
    this.currentWorkoutNameSubject.next(this.currentWorkoutName);
    this.saveToLocalStorage(); // Save to localStorage
  }



  /**
   * Adds a new exercise to the database
   * @param exercise The exercise data to add
   * @returns Observable with the response from the server
   */
  addExercise(exercise: ExerciseData): Observable<any> {
    return this.memberService.getUserId().pipe(
      switchMap(userId => {
        // Add user_id to the exercise data
        const exerciseWithUserId = {
          ...exercise,
          user_id: userId
        };

        return this.httpClient.post<any>(EndpointDictionary.addExercise, exerciseWithUserId).pipe(
          tap(response => {
            // Extract the exercise with ID from the response
            let newExercise: ExerciseData;

            if (response && response.id) {
              // Use the response if it has an ID
              newExercise = response;
            } else {
              // Log a warning if the backend doesn't provide an ID
              console.warn('Backend did not provide an ID for the new exercise. Using local ID generation as fallback.');

              // Create a new exercise with a locally generated ID
              newExercise = {
                ...exerciseWithUserId,
                id: this.generateLocalId(this.exercises)
              };
            }

            // Update the local array and notify subscribers
            this.exercises = [...this.exercises, newExercise];
            this.exercisesSubject.next(this.exercises);
          })
        );
      })
    );
  }

  /**
   * Generates a local ID for an entity when the backend doesn't provide one
   * @param items Array of items with ID property
   * @returns A new unique ID
   */
  private generateLocalId(items: { id?: number }[]): number {
    // If there are no items, start with ID 1
    if (items.length === 0) {
      return 1;
    }

    // Find the maximum ID and add 1
    return Math.max(...items.map(item => item.id || 0)) + 1;
  }

  /**
   * Returns the available exercise categories
   * @returns Array of exercise category names
   */
  getExerciseCategories(): string[] {
    // These categories could be fetched from a configuration or API in the future
    return [
      'Chest',
      'Back',
      'Legs',
      'Shoulders',
      'Arms',
      'Core',
      'Cardio',
      'Full Body',
      'Other'
    ];
  }

  /**
   * Deletes an exercise from the database
   * @param id The ID of the exercise to delete
   * @returns Observable with the response from the server
   */
  deleteExercise(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${EndpointDictionary.deleteExerciseById}${id}`).pipe(
      tap(() => {
        // Remove the exercise from the local array
        this.exercises = this.exercises.filter(e => e.id !== id);
        this.exercisesSubject.next(this.exercises);
      })
    );
  }

  /**
   * Gets all exercises for a specific user
   * @param userId The ID of the user
   * @returns Observable with the exercises for the user
   */
  getExercisesByUserId(userId: number): Observable<ExerciseData[]> {
    return this.httpClient.get<ExerciseData[]>(`${EndpointDictionary.getExercisesByUserId}${userId}`).pipe(
      tap(exercises => {
        // Update the local array and notify subscribers
        this.exercises = exercises;
        this.exercisesSubject.next(this.exercises);
      })
    );
  }

  /**
   * Gets the current exercises as an observable
   * @returns Observable of the current exercises
   */
  getExercises(): Observable<ExerciseData[]> {
    return this.exercisesSubject.asObservable();
  }

  /**
   * Adds an exercise to the current workout
   * @param exercise The exercise to add
   */
  addExerciseToCurrentWorkout(exercise: ExerciseData): void {
    // Check if the exercise is already in the current workout
    const exists = this.currentWorkoutExercises.some(e => e.id === exercise.id);
    if (!exists) {
      this.currentWorkoutExercises = [...this.currentWorkoutExercises, exercise];
      this.currentWorkoutExercisesSubject.next(this.currentWorkoutExercises);
      this.saveToLocalStorage(); // Save to localStorage
    }
  }

  /**
   * Gets the current workout exercises as an observable
   * @returns Observable of the current workout exercises
   */
  getCurrentWorkoutExercises(): Observable<ExerciseData[]> {
    return this.currentWorkoutExercisesSubject.asObservable();
  }

  /**
   * Clears the current workout data (exercises, sets, name)
   */
  clearCurrentWorkoutExercises(): void {
    this.currentWorkoutExercises = [];
    this.currentWorkoutExercisesSubject.next(this.currentWorkoutExercises);
    // Also clear the sets
    this.currentWorkoutSets = new Map<number, SetTrackingData[]>();
    this.currentWorkoutSetsSubject.next(this.currentWorkoutSets);
    // Also clear the workout name
    this.currentWorkoutName = '';
    this.currentWorkoutNameSubject.next(this.currentWorkoutName);
    // Clear localStorage
    localStorage.removeItem('currentWorkoutExercises');
    localStorage.removeItem('currentWorkoutSets');
    localStorage.removeItem('currentWorkoutName');
  }

  /**
   * Removes an exercise from the current workout
   * @param exerciseId The ID of the exercise to remove
   */
  removeExerciseFromCurrentWorkout(exerciseId: number): void {
    this.currentWorkoutExercises = this.currentWorkoutExercises.filter(e => e.id !== exerciseId);
    this.currentWorkoutExercisesSubject.next(this.currentWorkoutExercises);
    // Also remove the sets for this exercise
    this.currentWorkoutSets.delete(exerciseId);
    this.currentWorkoutSetsSubject.next(this.currentWorkoutSets);
    this.saveToLocalStorage(); // Save to localStorage
  }

  /**
   * Gets the current workout sets as an observable
   * @returns Observable of the current workout sets map
   */
  getCurrentWorkoutSets(): Observable<Map<number, SetTrackingData[]>> {
    return this.currentWorkoutSetsSubject.asObservable();
  }

  /**
   * Updates the sets for an exercise in the current workout
   * @param exerciseId The ID of the exercise
   * @param sets The new sets for the exercise
   */
  updateCurrentWorkoutSets(exerciseId: number, sets: SetTrackingData[]): void {
    this.currentWorkoutSets.set(exerciseId, sets);
    this.currentWorkoutSetsSubject.next(this.currentWorkoutSets);
    this.saveToLocalStorage(); // Save to localStorage
  }

  /**
   * Adds a set to an exercise in the current workout
   * @param exerciseId The ID of the exercise
   * @param set The set to add
   */
  addSetToCurrentWorkout(exerciseId: number, set: SetTrackingData): void {
    if (!this.currentWorkoutSets.has(exerciseId)) {
      this.currentWorkoutSets.set(exerciseId, []);
    }
    const sets = this.currentWorkoutSets.get(exerciseId) || [];
    sets.push(set);

    // Renumber sets to ensure they are in sequence
    const renumberedSets = sets.map((s, index) => ({
      ...s,
      set_id: index + 1
    }));

    this.currentWorkoutSets.set(exerciseId, renumberedSets);
    this.currentWorkoutSetsSubject.next(this.currentWorkoutSets);
    this.saveToLocalStorage(); // Save to localStorage
  }

  /**
   * Removes a set from an exercise in the current workout
   * @param exerciseId The ID of the exercise
   * @param setId The ID of the set to remove
   */
  removeSetFromCurrentWorkout(exerciseId: number, setId: number): void {
    if (this.currentWorkoutSets.has(exerciseId)) {
      const sets = this.currentWorkoutSets.get(exerciseId) || [];
      const updatedSets = sets.filter(s => s.set_id !== setId);

      // Renumber sets to ensure they are in sequence
      const renumberedSets = updatedSets.map((s, index) => ({
        ...s,
        set_id: index + 1
      }));

      this.currentWorkoutSets.set(exerciseId, renumberedSets);
      this.currentWorkoutSetsSubject.next(this.currentWorkoutSets);
      this.saveToLocalStorage(); // Save to localStorage
    }
  }

  /**
   * Updates a specific field in a set
   * @param exerciseId The ID of the exercise
   * @param setId The ID of the set
   * @param field The field to update ('weight' or 'reps')
   * @param value The new value for the field
   */
  updateSetField(exerciseId: number, setId: number, field: 'weight' | 'reps', value: number): void {
    if (this.currentWorkoutSets.has(exerciseId)) {
      const sets = this.currentWorkoutSets.get(exerciseId) || [];
      const setIndex = sets.findIndex(s => s.set_id === setId);
      if (setIndex !== -1) {
        sets[setIndex][field] = value;
        this.currentWorkoutSets.set(exerciseId, sets);
        this.currentWorkoutSetsSubject.next(this.currentWorkoutSets);
        this.saveToLocalStorage(); // Save to localStorage
      }
    }
  }

  /**
   * Adds a new workout to the database
   * @param workoutsDto The workout data to add
   * @returns Observable with the response from the server
   */
  addWorkout(workoutsDto: WorkoutsData): Observable<any> {
    return this.httpClient.post<any>(EndpointDictionary.addWorkout, workoutsDto);
  }

  /**
   * Adds a set tracking record to the database
   * @param setTrackingDto The set tracking data to add
   * @returns Observable with the response from the server
   */
  addSetTracking(setTrackingDto: SetTrackingData): Observable<any> {
    return this.httpClient.post<any>(EndpointDictionary.addSetTracking, setTrackingDto);
  }

  /**
   * Gets workouts for a specific month
   * @param userId The ID of the user
   * @param year The year
   * @param month The month (1-12)
   * @returns Observable with the monthly workouts data
   */
  getWorkoutsByMonth(userId: number, year: number, month: number): Observable<MonthlyWorkoutsData> {
    return this.httpClient.get<MonthlyWorkoutsData>(
      `${EndpointDictionary.getMonthlyWorkouts}?userId=${userId}&year=${year}&month=${month}`
    );
  }
}
