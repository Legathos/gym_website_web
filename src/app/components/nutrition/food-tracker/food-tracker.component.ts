import {Component, OnInit} from '@angular/core';
import {FoodService} from "@domain/food";
import { LoggerData} from "@domain/food/model/logger.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-food-tracker',
  templateUrl: './food-tracker.component.html',
  styleUrl: './food-tracker.component.scss'
})
export class FoodTrackerComponent implements OnInit {

  foodLogs: LoggerData[] = [];
  breakfastLogs: LoggerData[] = [];
  lunchLogs: LoggerData[] = [];
  dinnerLogs: LoggerData[] = [];
  protein = 0;
  carbs = 0;
  fats = 0;
  calories = this.protein * 4 + this.carbs * 4 + this.fats * 9;

  // Macros for each meal type
  breakfastProtein = 0;
  breakfastCarbs = 0;
  breakfastFats = 0;
  breakfastCalories = 0;

  lunchProtein = 0;
  lunchCarbs = 0;
  lunchFats = 0;
  lunchCalories = 0;

  dinnerProtein = 0;
  dinnerCarbs = 0;
  dinnerFats = 0;
  dinnerCalories = 0;
  date:string = new Date().toISOString().slice(0,10)

  constructor(
    private foodService: FoodService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.foodService.getFoodTrackingByIdAndDate(this.date).subscribe(data => {
      this.foodLogs = data;
      if (this.foodLogs) {
        // Group food logs by meal type
        this.groupFoodLogsByMealType();
        this.calculateTotalCalories();
        this.calculateMacros();
        // Calculate macros for each meal type
        this.calculateBreakfastMacros();
        this.calculateLunchMacros();
        this.calculateDinnerMacros();
      }
    });
  }

  groupFoodLogsByMealType(): void {
    // Clear existing arrays
    this.breakfastLogs = [];
    this.lunchLogs = [];
    this.dinnerLogs = [];

    // Group food logs by meal ID (1=breakfast, 2=lunch, 3=dinner)
    for (const log of this.foodLogs) {
      if (!log.meal || log.meal === 1) {
        this.breakfastLogs.push(log);
      } else if (log.meal === 2) {
        this.lunchLogs.push(log);
      } else if (log.meal === 3) {
        this.dinnerLogs.push(log);
      }
    }
  }

  calculateTotalCalories() {
    for (const log of this.foodLogs) {
      this.calories += log.calories;
    }
  }

  calculateMacros(){
    for (const log of this.foodLogs){
      this.protein+=log.protein;
      this.carbs+=log.carbs;
      this.fats+=log.fats;
    }
  }

  calculateBreakfastMacros() {
    // Reset values
    this.breakfastProtein = 0;
    this.breakfastCarbs = 0;
    this.breakfastFats = 0;
    this.breakfastCalories = 0;

    // Calculate macros for breakfast
    for (const log of this.breakfastLogs) {
      this.breakfastProtein += log.protein;
      this.breakfastCarbs += log.carbs;
      this.breakfastFats += log.fats;
      this.breakfastCalories += log.calories;
    }
  }

  calculateLunchMacros() {
    // Reset values
    this.lunchProtein = 0;
    this.lunchCarbs = 0;
    this.lunchFats = 0;
    this.lunchCalories = 0;

    // Calculate macros for lunch
    for (const log of this.lunchLogs) {
      this.lunchProtein += log.protein;
      this.lunchCarbs += log.carbs;
      this.lunchFats += log.fats;
      this.lunchCalories += log.calories;
    }
  }

  calculateDinnerMacros() {
    // Reset values
    this.dinnerProtein = 0;
    this.dinnerCarbs = 0;
    this.dinnerFats = 0;
    this.dinnerCalories = 0;

    // Calculate macros for dinner
    for (const log of this.dinnerLogs) {
      this.dinnerProtein += log.protein;
      this.dinnerCarbs += log.carbs;
      this.dinnerFats += log.fats;
      this.dinnerCalories += log.calories;
    }
  }

  addItem(meal: number) {
    // Navigate to food search with meal ID parameter
    this.router.navigate(['/food-search'], { state: { mealId: meal } });
  }

  editLogItem(logItem: LoggerData) {
    // Navigate to view-log-item page with the log item data for viewing/editing
    this.router.navigate(['/view-log-item'], {
      state: {
        logItem: logItem
      }
    });
  }

  deleteLogItem(logItem: LoggerData) {
    if (confirm('Are you sure you want to delete this food log?')) {
      this.foodService.deleteFoodLog(logItem).subscribe({
        next: () => {
          // Refresh the food logs after deletion
          this.foodService.getFoodTrackingByIdAndDate(this.date).subscribe(data => {
            this.foodLogs = data;
            // Reset all values
            this.protein = 0;
            this.carbs = 0;
            this.fats = 0;
            this.calories = 0;

            // Recalculate everything
            this.groupFoodLogsByMealType();
            this.calculateTotalCalories();
            this.calculateMacros();
            this.calculateBreakfastMacros();
            this.calculateLunchMacros();
            this.calculateDinnerMacros();
          });
        },
        error: (error) => {
          console.error('Error deleting food log:', error);
          alert('Failed to delete food log. Please try again.');
        }
      });
    }
  }
}
