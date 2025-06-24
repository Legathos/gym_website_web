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
  editMode: boolean = false;
  logItem: any = null;
  date: string = ''; // Will store the date for adding food items

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

      // Get the date from the navigation state if available
      if (history.state.date) {
        this.date = history.state.date;
      }

      // Check if we're in edit mode
      if (history.state.editMode) {
        this.editMode = history.state.editMode;
        this.logItem = history.state.logItem;

        // If we have a log item, use its weight
        if (this.logItem) {
          this.newWeight = this.logItem.weight;
          this.calculateNutritionalValues();
        }
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

    this.foodService.getUserId().subscribe(userId => {
      // Check if we have a valid user ID
      if (userId <= 0) {
        console.error('User ID not available. Please log in again.');
        // You could show an error message to the user here
        // For example, using a toast notification or alert
        alert('Please log in to add food to your tracker.');
        return;
      }

      // Use the selected date if available, otherwise use the current date
      const logDate = this.date ? new Date(this.date) : new Date();

      const loggerModel = {
        id: undefined,
        user_id: userId,
        date: logDate,
        food_id: this.foodItem.id,
        food_name: this.foodItem.name,
        meal: this.mealId,
        weight: this.foodItem.weight,
        calories: this.foodItem.calories,
        carbs: this.foodItem.carbs,
        protein: this.foodItem.protein,
        fats: this.foodItem.fats
      };

      // Call the appropriate service method based on edit mode
      if (this.editMode && this.logItem) {
        // Update existing log item
        this.foodService.editFoodLog(loggerModel).subscribe(() => {
          // Clear the cache for the selected date to ensure fresh data
          const dateToUse = this.date || this.formatDate(new Date());
          this.foodService.clearFoodTrackingCache(dateToUse);
          // Navigate back to the food tracker page
          this.router.navigate(['/food-tracker/:id']);
        });
      } else {
        // Add new log item
        this.foodService.addFoodToTracker(loggerModel).subscribe(() => {
          // Clear the cache for the selected date to ensure fresh data
          const dateToUse = this.date || this.formatDate(new Date());
          this.foodService.clearFoodTrackingCache(dateToUse);
          // Navigate back to the food tracker page
          this.router.navigate(['/food-tracker/:id']);
        });
      }
    });
  }

  onWeightChange() {
    this.calculateNutritionalValues();
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
}
