import {Component, OnInit} from '@angular/core';
import {RequestsService} from "../../../services/requests.service";
import {FoodData} from "../../../../data/food.data";

@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
  styleUrl: './food.component.scss'
})
export class FoodComponent implements OnInit{
  foodItems:FoodData[]=[];
  constructor(private requestsService:RequestsService) {
  }

  ngOnInit(){
    this.getAllFoodItems();
  }

  getAllFoodItems(){
      this.requestsService.getAllFoodItems()
        .subscribe({
          next: (data) => {
            this.foodItems = data;
            console.log(this.foodItems)
          },
          error: (error: any) => {
            console.error('Error fetching user details:', error);
            // Handle the error
          }
        });
  }

}
