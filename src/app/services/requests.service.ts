import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {EndpointDictionary} from "../../environments/endpoint-dictionary";
import {FoodData} from "../../data/food.data";

@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  url: string = 'http://localhost:8080/'
  constructor(private http: HttpClient) { }

  getAllFoodItems():Observable<any>{
    return this.http.get<FoodData[]>(EndpointDictionary.getAllFoodItems);
  }

  getUserWeightHistory(id:number):Observable<any>{
    const url = EndpointDictionary.getuserWeightHistory+id;
    return this.http.get(url);
  }

}
