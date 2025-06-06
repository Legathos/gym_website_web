import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { FoodData } from '@domain/food';
import { Location } from '@angular/common';

@Component({
  selector: 'app-view-food-item',
  templateUrl: './view-food-item.component.html',
  styleUrl: './view-food-item.component.scss'
})
export class ViewFoodItemComponent implements OnInit{

  @Input() foodItem!:FoodData;
  originalFoodItem!:FoodData;
  newWeight: number = 0;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private location: Location) {}

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.foodItem = history.state.foodItem;
      // Store the original values to use as a base for calculations
      this.originalFoodItem = {...this.foodItem};
      this.newWeight = this.foodItem.weight;
    });
  }

  navigate(url:string){
    this.router.navigateByUrl(url)
  }

  goBack() {
    this.location.back();
  }

  updateWeight() {
    if (this.newWeight <= 0) {
      return; // Prevent invalid weight values
    }

    // Calculate the ratio between new weight and original weight
    const ratio = this.newWeight / this.originalFoodItem.weight;

    // Update all nutritional values proportionally
    this.foodItem = {
      ...this.originalFoodItem,
      weight: this.newWeight,
      calories: Math.round(this.originalFoodItem.calories * ratio),
      carbs: parseFloat((this.originalFoodItem.carbs * ratio).toFixed(1)),
      fats: parseFloat((this.originalFoodItem.fats * ratio).toFixed(1)),
      protein: parseFloat((this.originalFoodItem.protein * ratio).toFixed(1))
    };
  }

  onWeightChange() {
    this.updateWeight();
  }
}
