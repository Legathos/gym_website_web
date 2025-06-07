import {Component, OnInit} from '@angular/core';
import {User} from "@domain/user";
import {UserWeightData} from "../../../data/userweight.data";
import {MemberService} from "@domain/member";
import {FoodService} from "@domain/food";
import {LoggerData} from "../../../data/logger.data";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
username!: string;
  user!: User;
  userWeightHistory!: UserWeightData[];

  // Food tracking data
  foodLogs: LoggerData[] = [];
  protein = 0;
  carbs = 0;
  fats = 0;
  calories = 0;
  date: string = new Date().toISOString().slice(0,10);

  constructor(
    private memberService: MemberService,
    private foodService: FoodService
  ) {
  }

  ngOnInit() {
    this.getUserData();
    this.getFoodTrackingData();
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

  getFoodTrackingData() {
    this.foodService.getFoodTrackingByIdAndDate(this.date).subscribe({
      next: (data) => {
        this.foodLogs = data;
        if (this.foodLogs) {
          this.calculateTotalCalories();
          this.calculateMacros();
          // Create the donut chart for macros
          setTimeout(() => {
            this.foodService.macrosChart(this.protein, this.carbs, this.fats);
          }, 100);
        }
      }
    });
  }

  calculateTotalCalories() {
    this.calories = 0;
    for (const log of this.foodLogs) {
      this.calories += log.calories;
    }
  }

  calculateMacros() {
    this.protein = 0;
    this.carbs = 0;
    this.fats = 0;
    for (const log of this.foodLogs) {
      this.protein += log.protein;
      this.carbs += log.carbs;
      this.fats += log.fats;
    }
  }
}
