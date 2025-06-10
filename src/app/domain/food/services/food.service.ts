import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EndpointDictionary } from '../../../../environments/endpoint-dictionary';
import { FoodData } from '@domain/food';
import {LoggerData} from "@domain/food/model/logger.model";
import {MemberService} from "@domain/member";
import {Chart} from "chart.js";

@Injectable()
export class FoodService {

  constructor( private httpClient: HttpClient, private memberService: MemberService) { }

  getUserId(): Observable<number> {
    return this.memberService.getUserId();
  }

  getAllFoodItems():Observable<any>{
    return this.httpClient.get<FoodData[]>(EndpointDictionary.getAllFoodItems);
  }

  getFoodTrackingByIdAndDate(date: String): Observable<any> {
    return this.memberService.getUserId().pipe(
      switchMap(id => {
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
      })
    );
  }

  getFoodItemsByName(name: String):Observable<any>{
    return this.httpClient.get<FoodData[]>(`${EndpointDictionary.getFoodItemsByName}${name}`);
  }

  getFoodById(id: number): Observable<FoodData> {
    return this.httpClient.get<FoodData>(`${EndpointDictionary.getFoodItemById}${id}`);
  }

  addFoodItemToDatabase(foodData: FoodData): Observable<any> {
    return this.httpClient.post<any>(EndpointDictionary.addFoodItem, foodData);
  }

  addFoodToTracker(loggerModel: LoggerData): Observable<any> {
    return this.httpClient.post<any>(EndpointDictionary.addNewLog, loggerModel);
  }

  editFoodLog(loggerModel: LoggerData): Observable<any> {
    return this.httpClient.put<any>(EndpointDictionary.editLogItem, loggerModel);
  }

  deleteFoodLog(loggerModel: LoggerData): Observable<any> {
    return this.httpClient.delete<any>(EndpointDictionary.deleteLogItem, { body: loggerModel });
  }

  getFoodDataFromBarcodeFromDatabase(barcode: number):Observable<any>{
    return this.httpClient.get<FoodData>(`${EndpointDictionary.getFoodItemByBarcodeFromDatabase}${barcode}`);
  }

  getFoodDataFromBarcode(barcode: string): Observable<FoodData> {
    return this.httpClient.get<any>(`${EndpointDictionary.getFoodItemByBarcodeFromApi}${barcode}`).pipe(
      map(response => {
        const data = typeof response === 'string' ? JSON.parse(response) : response;

        if (data.status === 0) {
          throw new Error('Product not found');
        }

        const nutriments = data.product?.nutriments;

        return {
          id: 0,
          barcode: data.product?.code || undefined,
          name:data.product?.product_name || data.product?.product_name_en || 'Unknown',
          weight: 100,
          calories: nutriments['energy-kcal_100g'] || 0,
          carbs: nutriments['carbohydrates_100g'] || 0,
          fats: nutriments['fat_100g'] || 0,
          protein: nutriments['proteins_100g'] || 0,
        } as FoodData;
      })
    );
  }
  macrosChart(protein:number, carbs:number, fats:number) {
    const data = {
      labels: [
        'Protein',
        'Carbs',
        'Fats'
      ],
      datasets: [{
        label: '',
        data: [protein * 4, carbs * 4, fats * 9],
        backgroundColor: [
          'rgb(200, 0, 200)',
          'rgb(54, 182, 235)',
          'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
      }]
    };

    const chartElement = document.getElementById('macros-chart');
    if (chartElement) {
      new Chart(
        <HTMLCanvasElement>chartElement,
        {
          type: 'doughnut',
          data: data,
          options: {
            cutout: "60%",
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
    } else {
      console.warn('Element with ID "macros-chart" not found. Chart could not be rendered.');
    }
  }
}
