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
  protein = 150;
  carbs = 200;
  fats = 50;
  calories = this.protein * 4 + this.carbs * 4 + this.fats * 9;
  date:string = new Date().toISOString().slice(0,10)

  constructor(private foodService: FoodService) {
  }

  ngOnInit(): void {
    this.foodService.macrosChart(this.protein, this.carbs, this.fats)
    this.getFoodTrackingByIdAndDate( this.date);
  }

  getFoodTrackingByIdAndDate( date: String) {
    this.foodService.getFoodTrackingByIdAndDate( date)
      .subscribe({
        next: (data) => {
          this.foodLogs = data;
        }
      })
  }
}
