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
import {Chart} from "chart.js";
import {UserWeightData} from "../../data/userweight.data";

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(private requestsService: RequestsService, private datePipe: DatePipe,
              private http: HttpClient,private httpUtilsService:HttpUtilsService,
              private jwtService:JwtServiceService,
              private cookieService:CookieService) { }


  registerUser(user:User):Observable<any>{
    const url:string = this.httpUtilsService.getFullUrl(environment.register);
    return this.http.post(url,user);
  }

  getUserData() {
    let username = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).username;
    return this.requestsService.getUserByUsername(username);
  }

  getUserWeightHistoryData(id:number){
    return this.requestsService.getUserWeightHistory(id)
  }

  weightChart(userWeightHistory:UserWeightData[]) {
    const data = userWeightHistory
    new Chart(
      <HTMLCanvasElement>document.getElementById('weight-chart'),
      {
        type: 'line',
        data: {
          labels: data.map(row => row.date.toString().slice(0,10)),
          datasets: [
            {
              label: 'Weight',
              data: data.map(row => row.weight)
            }
          ]
        },
        options: {}
      }
    );
  }
}
