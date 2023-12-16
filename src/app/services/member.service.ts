import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { RequestsService } from './requests.service';
import { HttpClient } from '@angular/common/http';
import {User} from "../../data/user.data";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {HttpUtilsService} from "./http-utils.service";

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(private requestsService: RequestsService, private datePipe: DatePipe,
              private http: HttpClient,private httpUtilsService:HttpUtilsService) { }

  getUserByUsername(username:string):Observable<any>{
    const url = this.httpUtilsService.getFullUrl(environment.getUserInfoByUsername)+username;
    return this.http.get<User>(url);
  }
  registerUser(user:User):Observable<any>{
    const url:string = this.httpUtilsService.getFullUrl(environment.register);
    return this.http.post(url,user);
  }
}
