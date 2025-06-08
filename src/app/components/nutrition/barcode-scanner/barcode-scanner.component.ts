import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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
  @ViewChild('video', {static: true}) videoElement!: ElementRef<HTMLVideoElement>;
  stream: MediaStream | null = null;
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
  ) {}

  async ngOnInit() {
    await this.startCamera();
    // For testing purposes only - remove in production
    // Uncomment the line below to see the food details card
    // this.scannedFood = this.mockFoodData;
  }
  ngOnDestroy() {
    // Clean up the stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = this.stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
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

}
