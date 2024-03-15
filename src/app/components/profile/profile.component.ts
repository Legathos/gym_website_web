import {Component, OnInit} from '@angular/core';
import {MemberService} from "@domain/member";
import {UserWeightData} from "../../../data/userweight.data";
import { User } from '@domain/user';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  username!: string;
  user!: User;
  userWeightHistory!: UserWeightData[];
  profileFormGroup!: FormGroup;

  constructor(private memberService: MemberService) {
  }

  ngOnInit() {
    this.getUserData();
    this.initLoginForm();
  }

  initLoginForm() {
    this.profileFormGroup = new FormGroup({
      age: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
    })
  }

  getUserData() {
    this.memberService.getUserData().subscribe({
      next: (data) => {
        this.user = data;
        this.getUserWeightHistoryData(this.user.id);
        this.profileFormGroup.patchValue(this.user);
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
