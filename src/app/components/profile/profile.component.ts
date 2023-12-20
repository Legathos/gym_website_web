import {Component, OnInit} from '@angular/core';
import {Chart} from "chart.js";
import {User} from "../../../data/user.data";
import {MemberService} from "../../services/member.service";
import {RequestsService} from "../../services/requests.service";
import {UserWeightData} from "../../../data/userweight.data";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  username!: string;
  user!: User;
  userWeightHistory!: UserWeightData[];

  constructor(private requestService: RequestsService,
              private memberService: MemberService) {
  }

  ngOnInit() {
    this.getUserData();
  }

  getUserData() {
    this.memberService.getUserData().subscribe({
      next: (data) => {
        this.user = data;
        this.getUserWeightHistoryData(this.user.id);
      }
    });
  }

  getUserWeightHistoryData(id: number) {
    let data
    console.log(this.user.id)
    this.memberService.getUserWeightHistoryData(id)
      .subscribe({
        next: (data) => {
          this.userWeightHistory = data;
          this.memberService.weightChart(this.userWeightHistory)
        }
      })
  }


}
