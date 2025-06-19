import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExerciseData } from '@domain/workouts/model/exercise.model';
import { SetTrackingData } from '@domain/workouts/model/set-tracking.model';
import { BehaviorSubject, Observable, tap, switchMap } from 'rxjs';
import { EndpointDictionary } from '../../../../environments/endpoint-dictionary';
import { MemberService } from '@domain/member';
import {WorkoutsData} from "@domain/workouts";

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

  // Load current workout data from localStorage
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
      console.error('Error loading workout data from localStorage:', error);
      // If there's an error, initialize with empty data
      this.currentWorkoutExercises = [];
      this.currentWorkoutSets = new Map();
      this.currentWorkoutName = '';
      this.currentWorkoutExercisesSubject.next(this.currentWorkoutExercises);
      this.currentWorkoutSetsSubject.next(this.currentWorkoutSets);
      this.currentWorkoutNameSubject.next(this.currentWorkoutName);
    }
  }

  // Save current workout data to localStorage
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
      console.error('Error saving workout data to localStorage:', error);
    }
  }

  // Get the current workout name as an observable
  getCurrentWorkoutName(): Observable<string> {
    return this.currentWorkoutNameSubject.asObservable();
  }

  // Set the current workout name
  setCurrentWorkoutName(name: string): void {
    this.currentWorkoutName = name;
    this.currentWorkoutNameSubject.next(this.currentWorkoutName);
    this.saveToLocalStorage(); // Save to localStorage
  }



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
            // If the backend returns the created exercise with an ID, use that
            const newExercise = response.id ? response : {
              ...exerciseWithUserId,
              // Fallback to generating an ID locally if the backend doesn't provide one
              id: this.exercises.length > 0
                ? Math.max(...this.exercises.map(e => e.id || 0)) + 1
                : 1
            };

            // Update the local array and notify subscribers
            this.exercises = [...this.exercises, newExercise];
            this.exercisesSubject.next(this.exercises);
          })
        );
      })
    );
  }

  getExerciseCategories(): string[] {
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

  deleteExercise(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${EndpointDictionary.deleteExerciseById}${id}`).pipe(
      tap(() => {
        // Remove the exercise from the local array
        this.exercises = this.exercises.filter(e => e.id !== id);
        this.exercisesSubject.next(this.exercises);
      })
    );
  }

  getExercisesByUserId(userId: number): Observable<ExerciseData[]> {
    return this.httpClient.get<ExerciseData[]>(`${EndpointDictionary.getExercisesByUserId}${userId}`).pipe(
      tap(exercises => {
        // Update the local array and notify subscribers
        this.exercises = exercises;
        this.exercisesSubject.next(this.exercises);
      })
    );
  }

  // Get the current exercises as an observable
  getExercises(): Observable<ExerciseData[]> {
    return this.exercisesSubject.asObservable();
  }

  // Add an exercise to the current workout
  addExerciseToCurrentWorkout(exercise: ExerciseData): void {
    // Check if the exercise is already in the current workout
    const exists = this.currentWorkoutExercises.some(e => e.id === exercise.id);
    if (!exists) {
      this.currentWorkoutExercises = [...this.currentWorkoutExercises, exercise];
      this.currentWorkoutExercisesSubject.next(this.currentWorkoutExercises);
      this.saveToLocalStorage(); // Save to localStorage
    }
  }

  // Get the current workout exercises as an observable
  getCurrentWorkoutExercises(): Observable<ExerciseData[]> {
    return this.currentWorkoutExercisesSubject.asObservable();
  }

  // Clear the current workout exercises
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

  // Remove an exercise from the current workout
  removeExerciseFromCurrentWorkout(exerciseId: number): void {
    this.currentWorkoutExercises = this.currentWorkoutExercises.filter(e => e.id !== exerciseId);
    this.currentWorkoutExercisesSubject.next(this.currentWorkoutExercises);
    // Also remove the sets for this exercise
    this.currentWorkoutSets.delete(exerciseId);
    this.currentWorkoutSetsSubject.next(this.currentWorkoutSets);
    this.saveToLocalStorage(); // Save to localStorage
  }

  // Get the current workout sets as an observable
  getCurrentWorkoutSets(): Observable<Map<number, SetTrackingData[]>> {
    return this.currentWorkoutSetsSubject.asObservable();
  }

  // Update the sets for an exercise in the current workout
  updateCurrentWorkoutSets(exerciseId: number, sets: SetTrackingData[]): void {
    this.currentWorkoutSets.set(exerciseId, sets);
    this.currentWorkoutSetsSubject.next(this.currentWorkoutSets);
    this.saveToLocalStorage(); // Save to localStorage
  }

  // Add a set to an exercise in the current workout
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

  // Remove a set from an exercise in the current workout
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

  // Update a specific field in a set
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

  // Add a new workout
  addWorkout(workoutsDto: WorkoutsData): Observable<any> {
    return this.httpClient.post<any>(EndpointDictionary.addWorkout, workoutsDto);
  }

  // Add a set tracking record
  addSetTracking(setTrackingDto: SetTrackingData): Observable<any> {
    return this.httpClient.post<any>(EndpointDictionary.addSetTracking, setTrackingDto);
  }
}
