import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { FoodData, FoodService } from '@domain/food';
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
  mealId: number = 1; // Default to breakfast

  constructor(private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              private foodService: FoodService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.foodItem = history.state.foodItem;
      // Store the original values to use as a base for calculations
      this.originalFoodItem = {...this.foodItem};
      this.newWeight = this.foodItem.weight;

      // Get the meal ID from the navigation state if available
      if (history.state.mealId) {
        this.mealId = history.state.mealId;
      }
    });
  }

  goBack() {
    this.location.back();
  }

  // Update nutritional values based on weight change
  calculateNutritionalValues() {
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

  logFoodItemToTracker() {
    this.calculateNutritionalValues();

    const userId = this.foodService.getUserId();

    // Check if we have a valid user ID
    if (userId <= 0) {
      console.error('User ID not available. Please log in again.');
      // You could show an error message to the user here
      // For example, using a toast notification or alert
      alert('Please log in to add food to your tracker.');
      return;
    }

    const loggerModel = {
      user_id: userId,
      date: new Date(),
      food_id: this.foodItem.id,
      food_name: this.foodItem.name,
      meal: this.mealId,
      weight: this.foodItem.weight,
      calories: this.foodItem.calories,
      carbs: this.foodItem.carbs,
      protein: this.foodItem.protein,
      fats: this.foodItem.fats
    };

    // Call the service to add the logger model to the tracker
    this.foodService.addFoodToTracker(loggerModel).subscribe(() => {
      // Navigate back to the food tracker page
      this.router.navigate(['/food-tracker/:id']);
    });
  }

  onWeightChange() {
    this.calculateNutritionalValues();
  }
}
