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

  constructor(
    private httpClient: HttpClient,
    private memberService: MemberService
  ) {
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
  }

  // Remove an exercise from the current workout
  removeExerciseFromCurrentWorkout(exerciseId: number): void {
    this.currentWorkoutExercises = this.currentWorkoutExercises.filter(e => e.id !== exerciseId);
    this.currentWorkoutExercisesSubject.next(this.currentWorkoutExercises);
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
