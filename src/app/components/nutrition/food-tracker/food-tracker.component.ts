import {Component, OnInit} from '@angular/core';
import {FoodService} from "@domain/food";
import {LoggerData} from "../../../../data/logger.data";
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
        this.foodService.macrosChart(this.protein, this.carbs, this.fats);
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

  addItem(meal: number) {
    // Navigate to food search with meal ID parameter
    this.router.navigate(['/food-search'], { state: { mealId: meal } });
  }
}
