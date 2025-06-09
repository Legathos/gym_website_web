import {Component, OnInit} from '@angular/core';
import {FoodData, FoodService} from "@domain/food";
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {Router} from "@angular/router";

@Component({
  selector: 'app-food-search',
  templateUrl: './food-search.component.html',
  styleUrl: './food-search.component.scss'
})
export class FoodSearchComponent implements OnInit{

  searchText: string = '';
  foodSearchResults: FoodData[] = [];
  mealId: number = 1; // Default to breakfast
  editMode: boolean = false;
  logItem: any = null; // Will store the log item data when editing
  private searchTerms = new Subject<string>();

  constructor(
    private foodService: FoodService,
    private router: Router
  ) {
    // Get the meal ID and edit mode from the navigation state if available
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      const state = navigation.extras.state as { mealId: number, editMode: boolean, logItem: any };
      if (state.mealId) {
        this.mealId = state.mealId;
      }
      if (state.editMode) {
        this.editMode = state.editMode;
        this.logItem = state.logItem;
      }
    }
  }

  ngOnInit() {
    // Initial empty search to load all items
    this.foodService.getFoodItemsByName('').subscribe(data => {
      this.foodSearchResults = data;
    });

    // Set up the search term observer with debounce
    this.searchTerms.pipe(
      // Wait 300ms after each keystroke before considering the term
      debounceTime(300),
      // Ignore if the search term is the same as the previous one
      distinctUntilChanged()
    ).subscribe(term => {
      // Only search if term length is 3 or more
      if (term.length >= 3) {
        this.foodService.getFoodItemsByName(term).subscribe(data => {
          this.foodSearchResults = data;
        });
      } else if (term.length === 0) {
        // If search is cleared, load all items
        this.foodService.getFoodItemsByName('').subscribe(data => {
          this.foodSearchResults = data;
        });
      }
    });
  }

  // Method to handle search input changes
  onSearchChange(term: string): void {
    this.searchTerms.next(term);
  }

  goBack() {
    this.router.navigate(['/food-tracker/:id']);
  }

  viewFoodItem(food: FoodData) {
    this.router.navigate(['/view-food-item'], {
      state: {
        foodItem: food,
        mealId: this.mealId,
        editMode: this.editMode,
        logItem: this.logItem
      }
    });
  }

  navigateToAiEstimator() {
    this.router.navigate(['/ai-estimator'], {
      state: {
        mealId: this.mealId,
        editMode: this.editMode,
        logItem: this.logItem
      }
    });
  }

  navigateToBarcodeScanner() {
    this.router.navigate(['/barcode-scanner'], {
      state: {
        mealId: this.mealId,
        editMode: this.editMode,
        logItem: this.logItem
      }
    });
  }

  // Method to navigate to the Add Food component
  navigateToAddFood() {
    this.router.navigate(['/add-food'], {
      state: {
        mealId: this.mealId,
        editMode: this.editMode,
        logItem: this.logItem
      }
    });
  }
}
