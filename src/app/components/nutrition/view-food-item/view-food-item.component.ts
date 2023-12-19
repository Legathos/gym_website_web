import {Component, Input, OnInit} from '@angular/core';
import {RequestsService} from "../../../services/requests.service";
import {FoodData} from "../../../../data/food.data";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-view-food-item',
  templateUrl: './view-food-item.component.html',
  styleUrl: './view-food-item.component.scss'
})
export class ViewFoodItemComponent implements OnInit{

  @Input() foodItem!:FoodData;


  constructor(private route: ActivatedRoute,
              private router: Router) {}


  ngOnInit() {
    // Retrieve the data from the route
    this.route.paramMap.subscribe(params => {
      this.foodItem = history.state.foodItem;
    });
  }

  navigate(url:string){
    this.router.navigateByUrl(url)
  }

}
