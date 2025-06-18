import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {forkJoin, map, Observable, of, shareReplay} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EndpointDictionary } from '../../../../environments/endpoint-dictionary';
import { FoodData } from '@domain/food';
import {LoggerData} from "@domain/food/model/logger.model";
import {MemberService} from "@domain/member";
import {Chart} from "chart.js";

@Injectable()
export class FoodService {
  // Cache for food tracking data to reduce API calls
  private foodTrackingCache: Map<string, Observable<LoggerData[]>> = new Map();
  // Cache for history data to avoid recalculating for the same period
  private proteinHistoryCache: Map<number, Observable<{date: string, protein: number}[]>> = new Map();
  private caloriesHistoryCache: Map<number, Observable<{date: string, calories: number}[]>> = new Map();
  private carbsHistoryCache: Map<number, Observable<{date: string, carbs: number}[]>> = new Map();
  private fatHistoryCache: Map<number, Observable<{date: string, fat: number}[]>> = new Map();

  // Maximum number of concurrent requests to make for longer periods
  private readonly MAX_CONCURRENT_REQUESTS = 10;

  constructor( private httpClient: HttpClient, private memberService: MemberService) { }

  getUserId(): Observable<number> {
    return this.memberService.getUserId();
  }

  getAllFoodItems():Observable<any>{
    return this.httpClient.get<FoodData[]>(EndpointDictionary.getAllFoodItems);
  }

  getFoodTrackingByIdAndDate(date: String): Observable<LoggerData[]> {
    return this.memberService.getUserId().pipe(
      switchMap(id => {
        // Check if we have a valid user ID
        if (id <= 0) {
          console.error('User ID not available for food tracking. Please log in again.');
          // Return an empty array as Observable
          return of([]);
        }

        // Create a cache key using user ID and date
        const cacheKey = `${id}-${date}`;

        // Check if we have cached data for this date
        if (this.foodTrackingCache.has(cacheKey)) {
          return this.foodTrackingCache.get(cacheKey)!;
        }

        // If not in cache, make the API call and cache the result
        const request = this.httpClient.get<LoggerData[]>(
          EndpointDictionary.getFoodTrackingByIdAndDate + id + `/` + date
        ).pipe(
          // Use shareReplay to cache the result and share it with multiple subscribers
          shareReplay(1)
        );

        // Store in cache
        this.foodTrackingCache.set(cacheKey, request);

        return request;
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

  /**
   * Gets protein intake history for the past N days
   * @param days Number of days to fetch history for (default: 7)
   * @returns Observable with an array of objects containing date and protein intake
   */
  getProteinIntakeHistory(days: number = 7): Observable<{date: string, protein: number}[]> {
    // Check if we have cached data for this period
    if (this.proteinHistoryCache.has(days)) {
      return this.proteinHistoryCache.get(days)!;
    }

    const result = this.memberService.getUserId().pipe(
      switchMap(userId => {
        if (userId <= 0) {
          console.error('User ID not available for protein history. Please log in again.');
          return of([]);
        }

        // Generate dates for the past N days
        const dates: string[] = [];
        const today = new Date();

        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const formattedDate = this.formatDate(date);
          dates.push(formattedDate);
        }

        // For longer periods, batch the requests to reduce load
        if (days > 30) {
          return this.batchProcessDates(dates, (date, logs) => {
            const totalProtein = logs.reduce((sum, log) => sum + log.protein, 0);
            return { date, protein: totalProtein };
          });
        } else {
          // For shorter periods, use the original approach but with cached data
          const requests = dates.map(date =>
            this.getFoodTrackingByIdAndDate(date).pipe(
              map(logs => {
                const totalProtein = logs.reduce((sum, log) => sum + log.protein, 0);
                return { date, protein: totalProtein };
              })
            )
          );

          return forkJoin(requests);
        }
      }),
      // Cache the result
      shareReplay(1)
    );

    // Store in cache
    this.proteinHistoryCache.set(days, result);

    return result;
  }

  /**
   * Processes dates in batches to reduce the number of concurrent API calls
   * @param dates Array of date strings to process
   * @param mapFn Function to map the logs for each date to the desired output format
   * @returns Observable with processed results for all dates
   */
  private batchProcessDates<T>(
    dates: string[],
    mapFn: (date: string, logs: LoggerData[]) => T
  ): Observable<T[]> {
    // Calculate batch size based on number of dates
    const batchSize = Math.max(
      1,
      Math.min(
        this.MAX_CONCURRENT_REQUESTS,
        Math.ceil(dates.length / 10)
      )
    );

    // Split dates into batches
    const batches: string[][] = [];
    for (let i = 0; i < dates.length; i += batchSize) {
      batches.push(dates.slice(i, i + batchSize));
    }

    // Process each batch sequentially
    return new Observable<T[]>(observer => {
      const results: T[] = [];

      // Process batches one at a time
      const processBatch = (index: number) => {
        if (index >= batches.length) {
          // All batches processed, return results sorted by date
          observer.next(results.sort((a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          ));
          observer.complete();
          return;
        }

        // Process current batch
        const batch = batches[index];
        const batchRequests = batch.map(date =>
          this.getFoodTrackingByIdAndDate(date).pipe(
            map(logs => mapFn(date, logs))
          )
        );

        forkJoin(batchRequests).subscribe({
          next: (batchResults) => {
            // Add batch results to overall results
            results.push(...batchResults);
            // Process next batch
            processBatch(index + 1);
          },
          error: (err) => observer.error(err)
        });
      };

      // Start processing with first batch
      processBatch(0);
    });
  }

  /**
   * Gets calories intake history for the past N days
   * @param days Number of days to fetch history for (default: 7)
   * @returns Observable with an array of objects containing date and calories intake
   */
  getCaloriesIntakeHistory(days: number = 7): Observable<{date: string, calories: number}[]> {
    // Check if we have cached data for this period
    if (this.caloriesHistoryCache.has(days)) {
      return this.caloriesHistoryCache.get(days)!;
    }

    const result = this.memberService.getUserId().pipe(
      switchMap(userId => {
        if (userId <= 0) {
          console.error('User ID not available for calories history. Please log in again.');
          return of([]);
        }

        // Generate dates for the past N days
        const dates: string[] = [];
        const today = new Date();

        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const formattedDate = this.formatDate(date);
          dates.push(formattedDate);
        }

        // For longer periods, batch the requests to reduce load
        if (days > 30) {
          return this.batchProcessDates(dates, (date, logs) => {
            const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
            return { date, calories: totalCalories };
          });
        } else {
          // For shorter periods, use the original approach but with cached data
          const requests = dates.map(date =>
            this.getFoodTrackingByIdAndDate(date).pipe(
              map(logs => {
                const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
                return { date, calories: totalCalories };
              })
            )
          );

          return forkJoin(requests);
        }
      }),
      // Cache the result
      shareReplay(1)
    );

    // Store in cache
    this.caloriesHistoryCache.set(days, result);

    return result;
  }

  /**
   * Gets carbs intake history for the past N days
   * @param days Number of days to fetch history for (default: 7)
   * @returns Observable with an array of objects containing date and carbs intake
   */
  getCarbsIntakeHistory(days: number = 7): Observable<{date: string, carbs: number}[]> {
    // Check if we have cached data for this period
    if (this.carbsHistoryCache.has(days)) {
      return this.carbsHistoryCache.get(days)!;
    }

    const result = this.memberService.getUserId().pipe(
      switchMap(userId => {
        if (userId <= 0) {
          console.error('User ID not available for carbs history. Please log in again.');
          return of([]);
        }

        // Generate dates for the past N days
        const dates: string[] = [];
        const today = new Date();

        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const formattedDate = this.formatDate(date);
          dates.push(formattedDate);
        }

        // For longer periods, batch the requests to reduce load
        if (days > 30) {
          return this.batchProcessDates(dates, (date, logs) => {
            const totalCarbs = logs.reduce((sum, log) => sum + log.carbs, 0);
            return { date, carbs: totalCarbs };
          });
        } else {
          // For shorter periods, use the original approach but with cached data
          const requests = dates.map(date =>
            this.getFoodTrackingByIdAndDate(date).pipe(
              map(logs => {
                const totalCarbs = logs.reduce((sum, log) => sum + log.carbs, 0);
                return { date, carbs: totalCarbs };
              })
            )
          );

          return forkJoin(requests);
        }
      }),
      // Cache the result
      shareReplay(1)
    );

    // Store in cache
    this.carbsHistoryCache.set(days, result);

    return result;
  }

  /**
   * Gets fat intake history for the past N days
   * @param days Number of days to fetch history for (default: 7)
   * @returns Observable with an array of objects containing date and fat intake
   */
  getFatIntakeHistory(days: number = 7): Observable<{date: string, fat: number}[]> {
    // Check if we have cached data for this period
    if (this.fatHistoryCache.has(days)) {
      return this.fatHistoryCache.get(days)!;
    }

    const result = this.memberService.getUserId().pipe(
      switchMap(userId => {
        if (userId <= 0) {
          console.error('User ID not available for fat history. Please log in again.');
          return of([]);
        }

        // Generate dates for the past N days
        const dates: string[] = [];
        const today = new Date();

        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const formattedDate = this.formatDate(date);
          dates.push(formattedDate);
        }

        // For longer periods, batch the requests to reduce load
        if (days > 30) {
          return this.batchProcessDates(dates, (date, logs) => {
            const totalFat = logs.reduce((sum, log) => sum + log.fats, 0);
            return { date, fat: totalFat };
          });
        } else {
          // For shorter periods, use the original approach but with cached data
          const requests = dates.map(date =>
            this.getFoodTrackingByIdAndDate(date).pipe(
              map(logs => {
                const totalFat = logs.reduce((sum, log) => sum + log.fats, 0);
                return { date, fat: totalFat };
              })
            )
          );

          return forkJoin(requests);
        }
      }),
      // Cache the result
      shareReplay(1)
    );

    // Store in cache
    this.fatHistoryCache.set(days, result);

    return result;
  }

  /**
   * Formats a date as YYYY-MM-DD
   * @param date The date to format
   * @returns Formatted date string
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
