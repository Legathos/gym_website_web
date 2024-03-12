import {Component, OnInit} from '@angular/core';
import {Chart} from "chart.js";
import {FoodService} from "@domain/food";
import {LoggerData} from "../../../../data/logger.data";
import {MemberService} from "@domain/member";
import {timeout} from "rxjs";

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
    this.macrosChart()
    this.getFoodTrackingByIdAndDate( "2023-2-23");

  }

  macrosChart() {
    const data = {
      labels: [
        'Protein',
        'Carbs',
        'Fats'
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [this.protein * 4, this.carbs * 4, this.fats * 9],
        backgroundColor: [
          'rgb(200, 0, 200)',
          'rgb(54, 182, 235)',
          'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
      }]
    };

    new Chart(
      <HTMLCanvasElement>document.getElementById('macros-chart'),
      {
        type: 'doughnut',
        data: data,
        options: {
          cutout: "80%",
          plugins: {
            legend: {
              position: 'right',
            }
          }
        }
      })

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
