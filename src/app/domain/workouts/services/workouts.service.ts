import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExerciseData } from '@domain/workouts/model/exercise.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { EndpointDictionary } from '../../../../environments/endpoint-dictionary';

@Injectable({
  providedIn: 'root'
})
export class WorkoutsService {
  private exercises: ExerciseData[] = [];
  private exercisesSubject = new BehaviorSubject<ExerciseData[]>([]);

  constructor(private httpClient: HttpClient) {
    this.loadExercises();
  }

  private loadExercises(): void {
    this.httpClient.get<ExerciseData[]>(EndpointDictionary.getAllExercises)
      .subscribe({
        next: (exercises) => {
          this.exercises = exercises;
          this.exercisesSubject.next(this.exercises);
        },
        error: (error) => {
          console.error('Error fetching exercises:', error);
        }
      });
  }

  getExercises(): Observable<ExerciseData[]> {
    return this.exercisesSubject.asObservable();
  }

  addExercise(exercise: ExerciseData): Observable<any> {
    return this.httpClient.post<any>(EndpointDictionary.addExercise, exercise).pipe(
      tap(response => {
        // If the backend returns the created exercise with an ID, use that
        const newExercise = response.id ? response : {
          ...exercise,
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
}
