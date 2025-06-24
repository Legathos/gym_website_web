import { Component, OnInit } from '@angular/core';
import { WorkoutsService } from '@domain/workouts/services/workouts.service';
import { WorkoutsData } from '@domain/workouts';
import { MemberService } from '@domain/member';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-workout-list',
  templateUrl: './view-workout-list.component.html',
  styleUrl: './view-workout-list.component.scss'
})
export class ViewWorkoutListComponent implements OnInit {
  workouts: WorkoutsData[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private workoutsService: WorkoutsService,
    private memberService: MemberService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWorkouts();
  }

  loadWorkouts(): void {
    this.loading = true;
    this.error = null;

    this.memberService.getUserId().subscribe({
      next: (userId) => {
        if (userId) {
          this.workoutsService.getAllWorkoutsByUserId(userId).subscribe({
            next: (workouts) => {
              this.workouts = workouts;
              this.loading = false;
            },
            error: (err) => {
              console.error('Error loading workouts:', err);
              this.error = 'Failed to load workouts. Please try again later.';
              this.loading = false;
            }
          });
        } else {
          this.error = 'User ID not found. Please log in again.';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error getting user ID:', err);
        this.error = 'Failed to authenticate user. Please log in again.';
        this.loading = false;
      }
    });
  }

  viewWorkoutDetails(workoutId: number): void {
    this.router.navigate(['/view-workout', workoutId]);
  }

  createNewWorkout(): void {
    this.memberService.getUserId().subscribe({
      next: (userId) => {
        if (userId) {
          this.router.navigate(['/current-workout', userId]);
        } else {
          this.error = 'User ID not found. Please log in again.';
        }
      },
      error: (err) => {
        console.error('Error getting user ID:', err);
        this.error = 'Failed to authenticate user. Please log in again.';
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
