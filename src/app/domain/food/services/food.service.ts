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

  constructor( private httpClient: HttpClient, private memberService: MemberService) { }

  getUserId(): number {
    return this.memberService.getUserId();
  }

  getAllFoodItems():Observable<any>{
    return this.httpClient.get<FoodData[]>(EndpointDictionary.getAllFoodItems);
  }

  getFoodTrackingByIdAndDate(date: String): Observable<any> {
    let id = this.memberService.getUserId();

    // Check if we have a valid user ID
    if (id <= 0) {
      console.error('User ID not available for food tracking. Please log in again.');
      // Return an empty array as Observable
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    return this.httpClient.get<LoggerData[]>(EndpointDictionary.getFoodTrackingByIdAndDate + id + `/` + date);
  }

  getFoodItemsByName(name: String):Observable<any>{
    return this.httpClient.get<FoodData[]>(`${EndpointDictionary.getFoodItemsByName}${name}`);
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

  addFoodToTracker(loggerModel: LoggerData): Observable<any> {
    // Send the LoggerDto directly to the backend
    return this.httpClient.post<any>(EndpointDictionary.addNewLog, loggerModel);
  }
}
