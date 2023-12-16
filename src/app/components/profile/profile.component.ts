import {Component, OnInit} from '@angular/core';
import {Chart} from "chart.js";
import {User} from "../../../data/user.data";
import {MemberService} from "../../services/member.service";
import {ActivatedRoute} from "@angular/router";
import {JwtServiceService} from "../../services/jwt-service.service";
import {CookieService} from "ngx-cookie-service";
import {RequestsService} from "../../services/requests.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  username!:string;
  user!: User;

  constructor(private requestService: RequestsService,
              private memberService:MemberService,
              private route: ActivatedRoute,
              private jwtService: JwtServiceService,
              private cookieService: CookieService) {
  }

  ngOnInit() {
    this.weightChart();
    this.getUserData()
    console.log(this.user)
  }

  getUserData(){
    this.route.queryParams.subscribe((queryParams) => {
      this.username = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).username;
      this.memberService.getUserByUsername(this.username)
        .subscribe({
          next: (user: User) => {
            console.log('User details:', user);
            this.user = user;
          },
          error: (error: any) => {
            console.error('Error fetching user details:', error);
            // Handle the error
          },
        });
    });
  }

  weightChart() {
    const data = [
      {date: "1-12-2023", weight: 95},
      {date: "2-12-2023", weight: 94},
      {date: "3-12-2023", weight: 90},
      {date: "4-12-2023", weight: 87},
      {date: "5-12-2023", weight: 91},
      {date: "6-12-2023", weight: 95},

    ];

    new Chart(
      <HTMLCanvasElement>document.getElementById('weight-chart'),
      {
        type: 'line',
        data: {
          labels: data.map(row => row.date),
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
