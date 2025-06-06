import {Component, OnInit} from '@angular/core';
import {FoodService} from "@domain/food";
import {LoggerData} from "../../../../data/logger.data";

@Component({
  selector: 'app-food-tracker',
  templateUrl: './food-tracker.component.html',
  styleUrl: './food-tracker.component.scss'
})
export class FoodTrackerComponent implements OnInit {

  foodLogs: LoggerData[] = [];
  protein = 0;
  carbs = 0;
  fats = 0;
  calories = this.protein * 4 + this.carbs * 4 + this.fats * 9;
  date:string = new Date().toISOString().slice(0,10)

  constructor(private foodService: FoodService) {
  }

  ngOnInit(): void {
    this.foodService.getFoodTrackingByIdAndDate(this.date).subscribe(data => {
      this.foodLogs = data;
      if (this.foodLogs) {
        this.calculateTotalCalories();
        this.calculateMacros();
        this.foodService.macrosChart(this.protein, this.carbs, this.fats);
      }
    });
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

  addItem() {
    // Your logic to add an item goes here
    alert("Item added!");
  }
}
