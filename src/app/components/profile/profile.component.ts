import {Component, OnInit} from '@angular/core';
import {Chart} from "chart.js";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{

  ngOnInit(){
    this.weightChart();
  }
  weightChart() {
    const data = [
      {date:"1-12-2023", weight: 95},
      {date:"2-12-2023", weight: 94},
      {date:"3-12-2023", weight: 90},
      {date:"4-12-2023", weight: 87},
      {date:"5-12-2023", weight: 91},
      {date:"6-12-2023", weight: 95},

    ];

    new Chart(
      <HTMLCanvasElement>document.getElementById('weight-chart'),
      {
        type: 'line',
        data: {
          labels: data.map(row => row.date),
          datasets: [
            {
              label: 'Weight',
              data: data.map(row => row.weight)
            }
          ]
        },
        options:{

        }
      }
    );
  }


}
