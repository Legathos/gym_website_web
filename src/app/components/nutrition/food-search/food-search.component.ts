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
  private searchTerms = new Subject<string>();

  constructor(
    private foodService: FoodService,
    private router: Router
  ) {
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
    window.history.back();
  }

  viewFoodItem(food: FoodData) {
    this.router.navigate(['/view-food-item'], { state: { foodItem: food } });
  }

}
