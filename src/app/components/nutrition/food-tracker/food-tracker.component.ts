import {Component, OnInit} from '@angular/core';
import {FoodService} from "@domain/food";
import { LoggerData} from "@domain/food/model/logger.model";
import {Router, NavigationEnd} from "@angular/router";
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { filter } from 'rxjs/operators';

// Declare the bootstrap global variable for TypeScript
declare global {
  interface Window {
    bootstrap: any;
  }
}
const bootstrap = window.bootstrap;

@Component({
  selector: 'app-food-tracker',
  templateUrl: './food-tracker.component.html',
  styleUrl: './food-tracker.component.scss'
})
export class FoodTrackerComponent implements OnInit {
  foodLogs: LoggerData[] = [];
  breakfastLogs: LoggerData[] = [];
  lunchLogs: LoggerData[] = [];
  dinnerLogs: LoggerData[] = [];
  protein = 0;
  carbs = 0;
  fats = 0;
  calories = this.protein * 4 + this.carbs * 4 + this.fats * 9;

  // Macros for each meal type
  breakfastProtein = 0;
  breakfastCarbs = 0;
  breakfastFats = 0;
  breakfastCalories = 0;

  lunchProtein = 0;
  lunchCarbs = 0;
  lunchFats = 0;
  lunchCalories = 0;

  dinnerProtein = 0;
  dinnerCarbs = 0;
  dinnerFats = 0;
  dinnerCalories = 0;
  date:string = this.getTodayDate()

  // Track the currently expanded item
  currentlyExpandedItem: string | null = null;

  constructor(
    private foodService: FoodService,
    private router: Router,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    // Load initial data
    this.loadFoodData();

    // Subscribe to router events to refresh data when navigating back to this component
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Check if the current URL is the food tracker page
      if (this.router.url.includes('/food-tracker')) {
        // Reload data when navigating back to this component
        this.loadFoodData();
      }
    });
  }

  /**
   * Loads food tracking data and calculates all necessary values
   */
  loadFoodData(): void {
    // Reset all values before loading new data
    this.protein = 0;
    this.carbs = 0;
    this.fats = 0;
    this.calories = 0;

    // Get today's food logs
    this.foodService.getFoodTrackingByIdAndDate(this.date).subscribe(data => {
      this.foodLogs = data;
      if (this.foodLogs) {
        // Group food logs by meal type
        this.groupFoodLogsByMealType();
        this.calculateTotalCalories();
        this.calculateMacros();
        // Calculate macros for each meal type
        this.calculateBreakfastMacros();
        this.calculateLunchMacros();
        this.calculateDinnerMacros();
      }
    });
  }

  groupFoodLogsByMealType(): void {
    // Clear existing arrays
    this.breakfastLogs = [];
    this.lunchLogs = [];
    this.dinnerLogs = [];

    // Group food logs by meal ID (1=breakfast, 2=lunch, 3=dinner)
    for (const log of this.foodLogs) {
      if (!log.meal || log.meal === 1) {
        this.breakfastLogs.push(log);
      } else if (log.meal === 2) {
        this.lunchLogs.push(log);
      } else if (log.meal === 3) {
        this.dinnerLogs.push(log);
      }
    }
  }

  calculateTotalCalories() {
    for (const log of this.foodLogs) {
      this.calories += log.calories;
    }
  }

  calculateMacros(){
    for (const log of this.foodLogs){
      this.protein+=log.protein;
      this.carbs+=log.carbs;
      this.fats+=log.fats;
    }
  }

  calculateBreakfastMacros() {
    // Reset values
    this.breakfastProtein = 0;
    this.breakfastCarbs = 0;
    this.breakfastFats = 0;
    this.breakfastCalories = 0;

    // Calculate macros for breakfast
    for (const log of this.breakfastLogs) {
      this.breakfastProtein += log.protein;
      this.breakfastCarbs += log.carbs;
      this.breakfastFats += log.fats;
      this.breakfastCalories += log.calories;
    }
  }

  calculateLunchMacros() {
    // Reset values
    this.lunchProtein = 0;
    this.lunchCarbs = 0;
    this.lunchFats = 0;
    this.lunchCalories = 0;

    // Calculate macros for lunch
    for (const log of this.lunchLogs) {
      this.lunchProtein += log.protein;
      this.lunchCarbs += log.carbs;
      this.lunchFats += log.fats;
      this.lunchCalories += log.calories;
    }
  }

  calculateDinnerMacros() {
    // Reset values
    this.dinnerProtein = 0;
    this.dinnerCarbs = 0;
    this.dinnerFats = 0;
    this.dinnerCalories = 0;

    // Calculate macros for dinner
    for (const log of this.dinnerLogs) {
      this.dinnerProtein += log.protein;
      this.dinnerCarbs += log.carbs;
      this.dinnerFats += log.fats;
      this.dinnerCalories += log.calories;
    }
  }

  addItem(meal: number) {
    // Navigate to food search with meal ID parameter
    this.router.navigate(['/food-search'], { state: { mealId: meal } });
  }

  editLogItem(logItem: LoggerData) {
    // Navigate to view-log-item page with the log item data for viewing/editing
    this.router.navigate(['/view-log-item'], {
      state: {
        logItem: logItem
      }
    });
  }

  deleteLogItem(logItem: LoggerData) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { question: 'Are you sure you want to delete this food log?', action: 'Delete' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.foodService.deleteFoodLog(logItem).subscribe({
          next: () => {
            // Clear the cache for today's date to ensure fresh data
            this.foodService.clearFoodTrackingCache(this.date);

            // Reload food data using the shared method
            this.loadFoodData();
          },
          error: (error) => {
            console.error('Error deleting food log:', error);
            alert('Failed to delete food log. Please try again.');
          }
        });
      }
    });
  }

  /**
   * Returns today's date in the format YYYY-MM-DD using local timezone
   */
  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Toggles the expansion state of a food item detail section.
   * Ensures only one item is expanded at a time by collapsing the previously expanded item.
   * @param itemId The ID of the item to toggle
   */
  toggleItemDetails(itemId: string): void {
    // If the clicked item is already expanded, collapse it
    if (this.currentlyExpandedItem === itemId) {
      this.currentlyExpandedItem = null;
      // Use Bootstrap's collapse API to hide the element
      const collapseElement = document.getElementById(itemId);
      if (collapseElement) {
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
        bsCollapse.hide();
      }
    } else {
      // If another item is currently expanded, collapse it first
      if (this.currentlyExpandedItem) {
        const previousElement = document.getElementById(this.currentlyExpandedItem);
        if (previousElement) {
          const bsCollapse = new bootstrap.Collapse(previousElement, { toggle: false });
          bsCollapse.hide();
        }
      }

      // Expand the clicked item
      this.currentlyExpandedItem = itemId;
      const newElement = document.getElementById(itemId);
      if (newElement) {
        const bsCollapse = new bootstrap.Collapse(newElement, { toggle: false });
        bsCollapse.show();
      }
    }
  }
}
