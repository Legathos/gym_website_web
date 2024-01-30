import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { FoodData } from '../../../services/food/model/food.model';

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
    this.route.paramMap.subscribe(() => {
      this.foodItem = history.state.foodItem;
    });
  }

  navigate(url:string){
    this.router.navigateByUrl(url)
  }

}
