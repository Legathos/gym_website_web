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
    // Check if there's any food data
    const hasData = protein > 0 || carbs > 0 || fats > 0;

    const data = {
      labels: [
        'Protein',
        'Carbs',
        'Fats'
      ],
      datasets: [{
        label: '',
        // If there's no data, use [1] to create a full circle with a single color
        data: hasData ? [protein * 4, carbs * 4, fats * 9] : [1],
        backgroundColor: hasData ? [
          'rgb(200, 0, 200)',
          'rgb(54, 182, 235)',
          'rgb(255, 205, 86)'
        ] : ['rgb(224, 224, 224)'], // Light grey for empty chart
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

  estimateFoodFromImage(imageDataUrl: string): Observable<FoodData> {
    // Extract the base64 data from the data URL
    const base64Image = imageDataUrl.split(',')[1];
    console.log(base64Image);

    // Create the proper request body structure
    const requestBody = {
      image_base64: base64Image
    };
    return this.httpClient.post<any>(EndpointDictionary.estimateFoodFromImage, requestBody).pipe(
      map(response => {
        // Handle different response formats
        const data = typeof response === 'string' ? JSON.parse(response) : response;

        // Log the response for debugging
        console.log('AI response:', data);

        // Extract data from the nested structure: {prediction:{...}, nutrition:{...}, top_prediction: {...}}
        const nutrition = data.nutrition || {};
        const topPrediction = data.top_prediction || {};

        // Helper function to extract numeric value from string with suffix
        const extractNumericValue = (value: any): number => {
          if (typeof value === 'number') return value;
          if (!value) return 0;

          // Convert to string and extract numeric part
          const valueStr = String(value);
          const numericMatch = valueStr.match(/^([-+]?[0-9]*\.?[0-9]+)/);
          return numericMatch ? parseFloat(numericMatch[0]) : 0;
        };

        // Transform the response to match FoodData interface
        // Replace underscores with spaces in the food name if present
        let foodName = topPrediction || 'Unknown Food';
        if (foodName && foodName.includes('_')) {
          foodName = foodName.replace(/_/g, ' ');
        }

        return {
          id: data.id || 0,
          barcode: data.barcode || undefined,
          name: foodName,
          weight: data.weight || 100,
          calories: extractNumericValue(nutrition.calories || data.calories || 0),
          carbs: extractNumericValue(nutrition.carbohydrates || data.carbs || 0),
          fats: extractNumericValue(nutrition.fat || data.fats || 0),
          protein: extractNumericValue(nutrition.protein || data.protein || 0),
        } as FoodData;
      })
    );
  }
}
