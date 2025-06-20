import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { FoodData, FoodService } from '@domain/food';
import { Location } from '@angular/common';

@Component({
  selector: 'app-add-food',
  templateUrl: './add-food.component.html',
  styleUrl: './add-food.component.scss'
})
export class AddFoodComponent implements OnInit {

  foodItem: FoodData = {
    id: 0,
    barcode: undefined,
    name: '',
    weight: 100,
    calories: 0,
    carbs: 0,
    fats: 0,
    protein: 0
  };

  // Default meal ID (1 = breakfast)
  mealId: number = 1;

  constructor(
    private router: Router,
    private location: Location,
    private foodService: FoodService
  ) {}

  ngOnInit() {
    // Check if food data was passed from barcode scanner
    const state = history.state;
    if (state && state.foodData) {
      // Use the passed food data
      this.foodItem = { ...state.foodData };
      console.log('Food data received from barcode scanner:', this.foodItem);
    }

    // Check if meal ID was passed
    if (state && state.mealId) {
      this.mealId = state.mealId;
    }
  }

  goBack() {
    this.location.back();
  }

  addFoodItem() {
    if (this.validateForm()) {
      this.foodService.addFoodItemToDatabase(this.foodItem).subscribe({
        next: (response) => {
          // Get the food item ID from the response if available, otherwise use the current ID
          const foodId = response?.id || this.foodItem.id;

          // Now also add the food item as a food log
          this.addFoodItemToLog(foodId);
        },
        error: (error) => {
          console.error('Error adding food item:', error);
          alert('Failed to add food item. Please try again.');
        }
      });
    }
  }

  /**
   * Adds the food item as a food log entry
   * @param foodId The ID of the food item in the database
   */
  private addFoodItemToLog(foodId: number) {
    this.foodService.getUserId().subscribe(userId => {
      // Check if we have a valid user ID
      if (userId <= 0) {
        console.error('User ID not available. Please log in again.');
        alert('Please log in to add food to your tracker.');
        return;
      }

      // Create the logger model
      const loggerModel = {
        id: undefined,
        user_id: userId,
        date: new Date(),
        food_id: foodId,
        food_name: this.foodItem.name,
        meal: this.mealId,
        weight: this.foodItem.weight,
        calories: this.foodItem.calories,
        carbs: this.foodItem.carbs,
        protein: this.foodItem.protein,
        fats: this.foodItem.fats
      };

      // Add the food item to the tracker
      this.foodService.addFoodToTracker(loggerModel).subscribe({
        next: () => {
          // Clear the cache for today's date to ensure fresh data
          const today = this.formatDate(new Date());
          this.foodService.clearFoodTrackingCache(today);

          // Navigate to the food tracker page
          this.router.navigate(['/food-tracker/:id']);
        },
        error: (error) => {
          console.error('Error adding food to tracker:', error);
          alert('Food item was added to database but failed to add to your meal tracker. Please try again.');
        }
      });
    });
  }

  /**
   * Formats a date as YYYY-MM-DD
   * @param date The date to format
   * @returns Formatted date string
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  validateForm(): boolean {
    // Basic validation
    if (!this.foodItem.name.trim()) {
      alert('Please enter a food name');
      return false;
    }

    if (this.foodItem.weight <= 0) {
      alert('Weight must be greater than 0');
      return false;
    }

    if (this.foodItem.calories < 0 || this.foodItem.carbs < 0 ||
        this.foodItem.fats < 0 || this.foodItem.protein < 0) {
      alert('Nutritional values cannot be negative');
      return false;
    }

    return true;
  }
}
