import { Injectable } from '@angular/core';
import { HttpUtilsService } from '../../http-utils/service/http-utils.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EndpointDictionary } from '../../../../environments/endpoint-dictionary';
import { User } from '../model/user.model';

@Injectable()
export class UserService {

  constructor(private httpUtilsService: HttpUtilsService, private httpClient: HttpClient) { }

  getUserByUsername(username:string):Observable<any>{
    const url = this.httpUtilsService.getFullUrl(EndpointDictionary.getUserInfoByUsername)+username;
    return this.httpClient.get<User>(url);
  }

  getUserWeightHistory(id:number):Observable<any>{
    const url = this.httpUtilsService.getFullUrl(EndpointDictionary.getuserWeightHistory+id);
    return this.httpClient.get(url)
  }
}
