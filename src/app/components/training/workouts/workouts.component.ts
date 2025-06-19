import { Component, OnInit } from '@angular/core';
import { WorkoutsService } from '@domain/workouts/services/workouts.service';
import { MemberService } from '@domain/member';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.scss'
})
export class WorkoutsComponent implements OnInit {
  exerciseCount: number = 0;

  constructor(
    private workoutsService: WorkoutsService,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    this.loadExerciseCount();
  }

  loadExerciseCount(): void {
    this.memberService.getUserId().subscribe(userId => {
      this.workoutsService.getExercisesByUserId(userId).subscribe({
        next: (exercises) => {
          this.exerciseCount = exercises.length;
        },
        error: (error) => {
          console.error('Error loading exercises:', error);
          this.exerciseCount = 0;
        }
      });
    });
  }
}
