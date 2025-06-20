import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutsService } from '@domain/workouts/services/workouts.service';
import { MemberService } from '@domain/member';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.scss'
})
export class WorkoutsComponent implements OnInit {
  exerciseCount: number = 0;

  // Calendar properties
  calendarWeeks: NgbDate[][] = [];
  currentMonth: string = '';
  currentYear: number = 0;
  today: NgbDate;

  constructor(
    private workoutsService: WorkoutsService,
    private memberService: MemberService,
    private router: Router,
    private calendar: NgbCalendar
  ) {
    this.today = calendar.getToday();
  }

  ngOnInit(): void {
    this.loadExerciseCount();
    this.generateCalendar();
  }

  /**
   * Generates a 5-week calendar centered on the current month
   */
  generateCalendar(): void {
    // Get the current date
    const today = this.calendar.getToday();
    this.today = today;

    // Set current month and year for display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    this.currentMonth = monthNames[today.month - 1];
    this.currentYear = today.year;

    // Get the first day of the current month
    const firstDayOfMonth = new NgbDate(today.year, today.month, 1);

    // Calculate which day of the week the first day of the month is (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = new Date(today.year, today.month - 1, 1).getDay();

    // Calculate how many days to go back to reach the Sunday before the first day of the month
    const daysToGoBack = firstDayOfWeek;

    // Calculate the start date (Sunday before the first day of the month)
    let startDate = this.calendar.getPrev(firstDayOfMonth, 'd', daysToGoBack);

    // Generate 5 weeks of dates
    this.calendarWeeks = [];
    for (let week = 0; week < 5; week++) {
      const weekDates: NgbDate[] = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = this.calendar.getNext(startDate, 'd', week * 7 + day);
        weekDates.push(currentDate);
      }
      this.calendarWeeks.push(weekDates);
    }
  }

  /**
   * Checks if a date is today
   * @param date The date to check
   * @returns True if the date is today, false otherwise
   */
  isToday(date: NgbDate): boolean {
    return date.year === this.today.year &&
           date.month === this.today.month &&
           date.day === this.today.day;
  }

  /**
   * Checks if a date is in the current month
   * @param date The date to check
   * @returns True if the date is in the current month, false otherwise
   */
  isCurrentMonth(date: NgbDate): boolean {
    return date.month === this.today.month;
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

  startNewWorkout(): void {
    this.memberService.getUserId().subscribe(userId => {
      this.router.navigate(['/current-workout', userId]);
    });
  }
}
