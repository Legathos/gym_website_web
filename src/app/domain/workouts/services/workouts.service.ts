import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExerciseData } from '@domain/workouts/model/exercise.model';
import { BehaviorSubject, Observable, tap, switchMap } from 'rxjs';
import { EndpointDictionary } from '../../../../environments/endpoint-dictionary';
import { MemberService } from '@domain/member';

@Injectable({
  providedIn: 'root'
})
export class WorkoutsService {
  private exercises: ExerciseData[] = [];
  private exercisesSubject = new BehaviorSubject<ExerciseData[]>([]);

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
}
