import {Component, OnInit} from '@angular/core';
import {Chart} from "chart.js";
import {FoodService} from "@domain/food";
import {LoggerData} from "../../../../data/logger.data";


@Component({
  selector: 'app-food-tracker',
  templateUrl: './food-tracker.component.html',
  styleUrl: './food-tracker.component.scss'
})
export class FoodTrackerComponent implements OnInit {

  foodLogs: LoggerData[] = [];
  protein = 150;
  carbs = 200;
  fats = 50;
  calories = this.protein * 4 + this.carbs * 4 + this.fats * 9;

  constructor(private foodService: FoodService) {
  }

  ngOnInit(): void {
    this.foodService.macrosChart(this.protein, this.carbs, this.fats)
    this.getFoodTrackingByIdAndDate( "2023-2-23");

  }

  getFoodTrackingByIdAndDate( date: String) {
    this.foodService.getFoodTrackingByIdAndDate( date)
      .subscribe({
        next: (data) => {
          this.foodLogs = data;
          console.log(data)
        }
      })
  }
}
