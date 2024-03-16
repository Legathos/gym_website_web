import {Component, OnInit} from '@angular/core';
import {Chart} from "chart.js";

@Component({
  selector: 'app-food-tracker',
  templateUrl: './food-tracker.component.html',
  styleUrl: './food-tracker.component.scss'
})
export class FoodTrackerComponent implements OnInit{

  protein= 150;
  carbs=200;
  fats = 50;
  calories=this.protein*4+this.carbs*4+this.fats*9;

  ngOnInit(): void {
  this.macrosChart()
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
        data: [this.protein*4, this.carbs*4, this.fats*9],
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
}
