import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {RequestsService} from "../../../services/requests.service";
import {FoodData} from "../../../../data/food.data";
import {Route, Router} from "@angular/router";
import {EndpointDictionary} from "../../../../environments/endpoint-dictionary";

@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
  styleUrl: './food.component.scss'
})
export class FoodComponent implements OnInit{
  foodItems:FoodData[]=[];
  constructor(private requestsService:RequestsService,
              private router:Router) {
  }

  ngOnInit(){
    this.getAllFoodItems();
  }

  navigateToItem(foodItem: any) {
    this.router.navigate(['view-food-item'], { state: { foodItem } });
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
