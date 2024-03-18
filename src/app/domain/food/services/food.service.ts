import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { EndpointDictionary } from '../../../../environments/endpoint-dictionary';

import { FoodData } from '@domain/food';
import {LoggerData} from "../../../../data/logger.data";
import {MemberService} from "@domain/member";
import {Chart} from "chart.js";

@Injectable()
export class FoodService {

  constructor( private httpClient: HttpClient,private memberService: MemberService) { }

  getAllFoodItems():Observable<any>{
    return this.httpClient.get<FoodData[]>(EndpointDictionary.getAllFoodItems);
  }

  getFoodTrackingByIdAndDate( date:String):Observable<any>{
    let id  = this.memberService.getUserId()
    return this.httpClient.get<LoggerData[]>(EndpointDictionary.getFoodTrackingByIdAndDate+id+`/`+date)

  }

  macrosChart(protein:number, carbs:number, fats:number) {
    const data = {
      labels: [
        'Protein',
        'Carbs',
        'Fats'
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [protein * 4, carbs * 4, fats * 9],
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
