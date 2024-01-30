import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import { FoodService } from '../../../services/food/services/food.service';
import { FoodData } from '../../../services/food/model/food.model';

@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
  styleUrl: './food.component.scss'
})
export class FoodComponent implements OnInit{
  foodItems:FoodData[]=[];
  constructor(private foodService: FoodService,
              private router:Router) {
  }

  ngOnInit(){
    this.getAllFoodItems();
  }

  navigateToItem(foodItem: any) {
    this.router.navigate(['view-food-item'], { state: { foodItem } });
  }

  getAllFoodItems(){
      this.foodService.getAllFoodItems()
        .subscribe({
          next: (data) => {
            this.foodItems = data;
          },
          error: (error: any) => {
            console.error('Error fetching user details:', error);
          }
        });
  }

}
