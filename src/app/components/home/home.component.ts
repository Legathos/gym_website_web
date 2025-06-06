import {Component, OnInit} from '@angular/core';
import {User} from "@domain/user";
import {UserWeightData} from "../../../data/userweight.data";
import {MemberService} from "@domain/member";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
username!: string;
  user!: User;
  userWeightHistory!: UserWeightData[];

  constructor(
    private memberService: MemberService,
  ) {
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
    this.memberService.getUserWeightHistoryData(id)
      .subscribe({
        next: (data) => {
          this.userWeightHistory = data;
          this.memberService.weightChart(this.userWeightHistory)
        }
      })
  }


}
