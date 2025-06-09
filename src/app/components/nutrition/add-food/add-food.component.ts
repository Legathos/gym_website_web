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
  }

  goBack() {
    this.location.back();
  }

  addFoodItem() {
    if (this.validateForm()) {
      this.foodService.addFoodItemToDatabase(this.foodItem).subscribe({
        next: () => {
          // Navigate back or to food search page
          this.router.navigate(['/food-tracker/:id']);
        },
        error: (error) => {
          console.error('Error adding food item:', error);
          alert('Failed to add food item. Please try again.');
        }
      });
    }
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
