import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpUtilsService } from './http-utils.service';
import {Observable} from "rxjs";
import {User} from "../../data/user.data";
import {environment} from "../../environments/environment";
import {FoodData} from "../../data/food.data";


@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  url: string = 'http://localhost:8080/'
  constructor(private http: HttpClient, private httpUtilsService: HttpUtilsService) { }

  getUserByUsername(username:string):Observable<any>{
    const url = this.httpUtilsService.getFullUrl(environment.getUserInfoByUsername)+username;
    return this.http.get<User>(url);
  }

  getAllFoodItems():Observable<any>{
    const url = this.httpUtilsService.getFullUrl(environment.getAllFoodItems);
    return this.http.get<FoodData[]>(url);
  }

  getFoodItemById(id:number):Observable<any>{
    const url = this.httpUtilsService.getFullUrl((environment.getFoodItemById))+id;
    return this.http.get<FoodData>(url);
  }
}
