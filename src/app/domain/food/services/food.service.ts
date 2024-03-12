import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { EndpointDictionary } from '../../../../environments/endpoint-dictionary';

import { FoodData } from '@domain/food';
import {LoggerData} from "../../../../data/logger.data";
import {MemberService} from "@domain/member";

@Injectable()
export class FoodService {

  constructor( private httpClient: HttpClient,private memberService: MemberService) { }

  getAllFoodItems():Observable<any>{
    return this.httpClient.get<FoodData[]>(EndpointDictionary.getAllFoodItems);
  }

  getFoodTrackingByIdAndDate( date:String):Observable<any>{
    let id  = this.memberService.getUserId()
    return this.httpClient.get<LoggerData[]>(EndpointDictionary.getFoodTrackingByIdAndDate+id+`/`+date)

  }
}
