import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FoodService } from '@domain/food/services/food.service';
import { FoodData } from '@domain/food';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  styleUrl: './barcode-scanner.component.scss'
})
export class BarcodeScannerComponent implements OnInit {
  // This will be populated when a barcode is scanned
  scannedFood: FoodData | null = null;

  // For testing purposes only - remove in production
  mockFoodData: FoodData = {
    id: 1,
    name: 'Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
    weight: 100
  };

  constructor(
    private location: Location,
    private foodService: FoodService
  ) {}

  ngOnInit(): void {
    // For testing purposes only - remove in production
    // Uncomment the line below to see the food details card
    // this.scannedFood = this.mockFoodData;
  }

  // Navigate back to the previous page
  goBack(): void {
    this.location.back();
  }

  // Add the scanned food to the meal tracker
  addToMeal(): void {
    if (this.scannedFood) {
      // This functionality will be implemented later
      console.log('Adding to meal:', this.scannedFood);
      // Navigate back or to the food tracker
      this.goBack();
    }
  }

  // This method will be called when a barcode is scanned (to be implemented later)
  onBarcodeScanned(barcode: string): void {
    // Mock implementation - in the future, this will call an API to get food data by barcode
    console.log('Barcode scanned:', barcode);

    // For now, we'll just set some mock data for testing
    this.scannedFood = this.mockFoodData;

    // In a real implementation, we would call the food service to get the data
    // this.foodService.getFoodByBarcode(barcode).subscribe(food => {
    //   this.scannedFood = food;
    // });
  }
}
