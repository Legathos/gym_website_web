import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FoodData } from '@domain/food';

@Component({
  selector: 'app-ai-estimator',
  templateUrl: './ai-estimator.component.html',
  styleUrl: './ai-estimator.component.scss'
})
export class AiEstimatorComponent implements OnInit {
  // This will be populated when a food is estimated by AI
  estimatedFood: FoodData | null = null;

  // For testing purposes only - remove in production
  mockFoodData: FoodData = {
    id: 2,
    name: 'Grilled Salmon',
    calories: 206,
    protein: 22.1,
    carbs: 0,
    fats: 13.4,
    weight: 100
  };

  constructor(
    private location: Location,
  ) {}

  ngOnInit(): void {
    // For testing purposes only - remove in production
    // Uncomment the line below to see the food details card
    // this.estimatedFood = this.mockFoodData;
  }

  // Navigate back to the previous page
  goBack(): void {
    this.location.back();
  }

  // Add the estimated food to the meal tracker
  addToMeal(): void {
    if (this.estimatedFood) {
      // This functionality will be implemented later
      console.log('Adding to meal:', this.estimatedFood);
      // Navigate back or to the food tracker
      this.goBack();
    }
  }

  // This method will be called when a photo is taken and analyzed (to be implemented later)
  onFoodEstimated(foodData: FoodData): void {
    // In a real implementation, this would receive data from an AI service
    console.log('Food estimated:', foodData);
    this.estimatedFood = foodData;
  }
}
