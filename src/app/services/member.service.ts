import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { RequestsService } from './requests.service';
import { HttpClient } from '@angular/common/http';
import { HttpUtilsService } from './http-utils.service';
import {JwtServiceService} from "./jwt-service.service";
import {User} from "../../data/user.data";
import {Observable} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(private requestsService: RequestsService, private datePipe: DatePipe,
              private http: HttpClient, private httpUtilsService: HttpUtilsService,private jwtService : JwtServiceService) { }

  getUserByUsername(username:string):Observable<User>{
    const url: string = 'http://localhost:8080/user/get-user-username-'+username;
    return this.http.get<User>(url);
  }


}
