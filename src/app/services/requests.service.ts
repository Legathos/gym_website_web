import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpUtilsService } from './http-utils.service';
import {Observable} from "rxjs";
import {EndpointDictionary} from "../../environments/endpoint-dictionary";
import {FoodData} from "../../data/food.data";

@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  url: string = 'http://localhost:8080/'
  constructor(private http: HttpClient, private httpUtilsService: HttpUtilsService) { }

  getAllFoodItems():Observable<any>{
    const url = this.httpUtilsService.getFullUrl(EndpointDictionary.getAllFoodItems);
    return this.http.get<FoodData[]>(url);
  }

  getUserWeightHistory(id:number):Observable<any>{
    const url = this.httpUtilsService.getFullUrl(EndpointDictionary.getuserWeightHistory+id);
    return this.http.get(url)
  }

}
