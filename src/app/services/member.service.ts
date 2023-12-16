import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { RequestsService } from './requests.service';
import { HttpClient } from '@angular/common/http';
import {User} from "../../data/user.data";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {HttpUtilsService} from "./http-utils.service";
import {JwtServiceService} from "./jwt-service.service";
import {CookieService} from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(private requestsService: RequestsService, private datePipe: DatePipe,
              private http: HttpClient,private httpUtilsService:HttpUtilsService,
              private jwtService:JwtServiceService,
              private cookieService:CookieService) { }

  getUserByUsername(username:string):Observable<any>{
    return this.requestsService.getUserByUsername(username);
}

  registerUser(user:User):Observable<any>{
    const url:string = this.httpUtilsService.getFullUrl(environment.register);
    return this.http.post(url,user);
  }

}
