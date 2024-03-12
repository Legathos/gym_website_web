import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";
import {EndpointDictionary} from "../../../../environments/endpoint-dictionary";
import {JwtService} from "@core/auth";
import {CookieService} from "ngx-cookie-service";
import {Chart} from "chart.js";
import {UserWeightData} from "../../../../data/userweight.data";
import {User, UserService} from '@domain/user';

@Injectable()
export class MemberService {
  user!: User;

  constructor(private userService: UserService,
              private http: HttpClient,
              private jwtService: JwtService,
              private cookieService: CookieService
  ) {
  }

  registerUser(user: User): Observable<any> {
    return this.http.post(EndpointDictionary.register, user);
  }

  getUserData() {
    let username = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).username;
    return this.userService.getUserByUsername(username);
  }

  getUserId(){
      this.getUserData().subscribe({
        next: (data) => {
          this.user = data;
        }
      });
    return this.user.id
    }


  getUserWeightHistoryData(id: number) {
    return this.userService.getUserWeightHistory(id)
  }

  weightChart(userWeightHistory: UserWeightData[]) {
    const data = userWeightHistory
    new Chart(
      <HTMLCanvasElement>document.getElementById('weight-chart'),
      {
        type: 'line',
        data: {
          labels: data.map(row => row.date.toString().slice(0, 10)),
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
