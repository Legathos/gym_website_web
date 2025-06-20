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
  displayedMonth: number = 0;
  displayedYear: number = 0;

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

    // Initialize displayed month and year to current month and year
    const today = this.calendar.getToday();
    this.displayedMonth = today.month;
    this.displayedYear = today.year;

    this.generateCalendar();
  }

  /**
   * Generates a 5-week calendar centered on the displayed month
   */
  generateCalendar(): void {
    // Make sure today is set
    if (!this.today) {
      this.today = this.calendar.getToday();
    }

    // Set current month and year for display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    this.currentMonth = monthNames[this.displayedMonth - 1];
    this.currentYear = this.displayedYear;

    // Get the first day of the displayed month
    const firstDayOfMonth = new NgbDate(this.displayedYear, this.displayedMonth, 1);

    // Calculate which day of the week the first day of the month is (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = new Date(this.displayedYear, this.displayedMonth - 1, 1).getDay();

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
   * Checks if a date is in the displayed month
   * @param date The date to check
   * @returns True if the date is in the displayed month, false otherwise
   */
  isCurrentMonth(date: NgbDate): boolean {
    return date.month === this.displayedMonth;
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

  /**
   * Navigate to the previous month
   */
  previousMonth(): void {
    if (this.displayedMonth === 1) {
      // If January, go to December of previous year
      this.displayedMonth = 12;
      this.displayedYear--;
    } else {
      // Otherwise, just go to previous month
      this.displayedMonth--;
    }
    this.generateCalendar();
  }

  /**
   * Navigate to the next month
   */
  nextMonth(): void {
    if (this.displayedMonth === 12) {
      // If December, go to January of next year
      this.displayedMonth = 1;
      this.displayedYear++;
    } else {
      // Otherwise, just go to next month
      this.displayedMonth++;
    }
    this.generateCalendar();
  }
}
