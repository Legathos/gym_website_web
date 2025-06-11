import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { FoodService } from '@domain/food';
import { Location } from '@angular/common';
import { LoggerData} from "@domain/food/model/logger.model";
import { switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-view-log-item',
  templateUrl: './view-log-item.component.html',
  styleUrl: './view-log-item.component.scss'
})
export class ViewLogItemComponent implements OnInit {

  @Input() logItem!: LoggerData;
  originalLogItem!: LoggerData;
  newWeight: number = 0;
  mealId: number = 1; // Default to breakfast

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private foodService: FoodService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.logItem = history.state.logItem;

      // Store the original values to use as a base for calculations
      this.originalLogItem = {...this.logItem};
      this.newWeight = this.logItem.weight;

      // Get the meal ID from the log item
      if (this.logItem.meal) {
        this.mealId = this.logItem.meal;
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
    const ratio = this.newWeight / this.originalLogItem.weight;

    // Update all nutritional values proportionally
    this.logItem = {
      ...this.originalLogItem,
      weight: this.newWeight,
      calories: Math.round(this.originalLogItem.calories * ratio),
      carbs: parseFloat((this.originalLogItem.carbs * ratio).toFixed(1)),
      fats: parseFloat((this.originalLogItem.fats * ratio).toFixed(1)),
      protein: parseFloat((this.originalLogItem.protein * ratio).toFixed(1))
    };
  }

  updateLogItem() {
    this.calculateNutritionalValues();

    this.foodService.getUserId().subscribe(userId => {
      // Check if we have a valid user ID
      if (userId <= 0) {
        console.error('User ID not available. Please log in again.');
        alert('Please log in to update your food log.');
        return;
      }

      // Update existing log item
      this.foodService.editFoodLog(this.logItem).subscribe(() => {
        // Navigate back to the food tracker page
        this.router.navigate(['/food-tracker/:id']);
      });
    });
  }

  onWeightChange() {
    this.calculateNutritionalValues();
  }

  deleteLogItem() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { question: 'Are you sure you want to delete this food log?', action: 'Delete' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.foodService.deleteFoodLog(this.logItem).subscribe({
          next: () => {
            this.router.navigate(['/food-tracker/:id']);
          },
          error: (error) => {
            console.error('Error deleting food log:', error);
            alert('Failed to delete food log. Please try again.');
          }
        });
      }
    });
  }
}
