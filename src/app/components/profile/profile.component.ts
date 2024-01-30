import {Component, OnInit} from '@angular/core';
import {MemberService} from "../../services/member";
import {UserWeightData} from "../../../data/userweight.data";
import { User } from '../../services/user/model/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  username!: string;
  user!: User;
  userWeightHistory!: UserWeightData[];

  constructor(private memberService: MemberService) {
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
