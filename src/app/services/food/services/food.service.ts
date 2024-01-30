import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FoodData } from '../model/food.model';
import { EndpointDictionary } from '../../../../environments/endpoint-dictionary';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class FoodService {

  constructor( private httpClient: HttpClient) { }

  getAllFoodItems():Observable<any>{
    return this.httpClient.get<FoodData[]>(EndpointDictionary.getAllFoodItems);
  }
}
