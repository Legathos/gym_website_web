import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { EndpointDictionary } from '../../../../environments/endpoint-dictionary';

import { FoodData } from '@domain/food';

@Injectable()
export class FoodService {

  constructor( private httpClient: HttpClient) { }

  getAllFoodItems():Observable<any>{
    return this.httpClient.get<FoodData[]>(EndpointDictionary.getAllFoodItems);
  }
}
