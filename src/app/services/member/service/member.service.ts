import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";
import {EndpointDictionary} from "../../../../environments/endpoint-dictionary";
import {JwtServiceService} from "../../../core/auth/jwt-service.service";
import {CookieService} from "ngx-cookie-service";
import {Chart} from "chart.js";
import {UserWeightData} from "../../../../data/userweight.data";
import { UserService } from '../../user/services/user.service';
import { User } from '../../user/model/user.model';

@Injectable()
export class MemberService {

  constructor(private userService: UserService,
              private http: HttpClient,
              private jwtService:JwtServiceService,
              private cookieService:CookieService
              ) { }

  registerUser(user: User):Observable<any>{
    return this.http.post(EndpointDictionary.register,user);
  }

  getUserData() {
    let username = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).username;
    return this.userService.getUserByUsername(username);
  }

  getUserWeightHistoryData(id:number){
    return this.userService.getUserWeightHistory(id)
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
