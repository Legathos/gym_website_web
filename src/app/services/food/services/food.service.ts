import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FoodData } from '../model/food.model';
import { EndpointDictionary } from '../../../../environments/endpoint-dictionary';
import { HttpUtilsService } from '../../http-utils';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class FoodService {

  constructor(private httpUtilsService: HttpUtilsService, private httpClient: HttpClient) { }

  getAllFoodItems():Observable<any>{
    const url = this.httpUtilsService.getFullUrl(EndpointDictionary.getAllFoodItems);
    return this.httpClient.get<FoodData[]>(url);
  }
}
