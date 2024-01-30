import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EndpointDictionary } from '../../../../environments/endpoint-dictionary';
import { User } from '../model/user.model';

@Injectable()
export class UserService {

  constructor( private httpClient: HttpClient) { }

  getUserByUsername(username:string):Observable<any>{
    const url = EndpointDictionary.getUserInfoByUsername+username;
    return this.httpClient.get<User>(url);
  }
}
