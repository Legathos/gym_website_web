import {Component, OnInit} from '@angular/core';
import {RequestsService} from "../../../services/requests.service";
import {FoodComponent} from "../food/food.component";
import {FoodData} from "../../../../data/food.data";

@Component({
  selector: 'app-view-food-item',
  templateUrl: './view-food-item.component.html',
  styleUrl: './view-food-item.component.scss'
})
export class ViewFoodItemComponent implements OnInit{

  foodItem!:[FoodData];

  constructor(private requestsService:RequestsService) {
  }

  ngOnInit() {

  }

  getFoodItem(id:number){
    this.requestsService.getFoodItemById(id).subscribe({
      next:(data)=>{
        this.foodItem = data;
      }
    })
  }

}
