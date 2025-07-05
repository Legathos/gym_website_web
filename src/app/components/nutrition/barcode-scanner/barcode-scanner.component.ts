import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Location } from '@angular/common';
import { FoodData, FoodService } from '@domain/food';
import { Router } from '@angular/router';
import {BarcodeFormat, BrowserMultiFormatReader, IScannerControls} from "@zxing/browser";
import { Result } from '@zxing/library';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  styleUrl: './barcode-scanner.component.scss'
})
export class BarcodeScannerComponent implements OnInit, OnDestroy{
  // This will be populated when a barcode is scanned
  scannedFood: FoodData | null = null;
  @ViewChild('video', {static: true}) videoElement!: ElementRef<HTMLVideoElement>;
  stream: MediaStream | null = null;
  scanner: BrowserMultiFormatReader = new BrowserMultiFormatReader();
  scanning = true;
  controls: IScannerControls | null = null;
  lastFrameUrl: string | null = null; // Store the last frame as a data URL

  // User input for food amount in grams
  foodAmount: number = 100; // Default to 100g

  // Default meal ID (1 = breakfast)
  mealId: number = 1;

  // Helper methods for template calculations
  calculateCalories(calories: number): number {
    return Math.round(calories * this.foodAmount / 100);
  }

  calculateNutrient(value: number): string {
    return (value * this.foodAmount / 100).toFixed(1);
  }

  constructor(
    private location: Location,
    private foodService: FoodService,
    private router: Router
  ) {
    // Set the possible barcode formats to scan for
    this.scanner.possibleFormats = [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_128,
      BarcodeFormat.QR_CODE
    ];
  }

  ngOnInit() {
    // Check if meal ID was passed from the previous component
    const state = history.state;
    if (state && state.mealId) {
      this.mealId = state.mealId;
    }

    this.startBarcodeScanner();
  }

  ngOnDestroy(): void {
    this.scanning = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  async startBarcodeScanner() {
    try {
      console.log('Starting barcode scanner...');
      // Make sure video is ready
      if (!this.videoElement || !this.videoElement.nativeElement) {
        console.error('Video element not found');
        return;
      }

      // Set optimized video constraints for efficient barcode detection
      const constraints = {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        facingMode: 'environment', // Use back camera on mobile devices
        aspectRatio: { ideal: 16/9 }
      };

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: constraints
        });
        this.videoElement.nativeElement.srcObject = this.stream;
      } catch (err) {
        // Fallback to basic video if advanced constraints fail
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.videoElement.nativeElement.srcObject = this.stream;
      }

      this.controls = await this.scanner.decodeFromVideoDevice(
        undefined,
        this.videoElement.nativeElement,
        (result: Result | undefined, error, controls: IScannerControls) => {
          console.log('Barcode scanning result:', result);
          if (error) {
            return;
          }
          if (result && this.scanning) {
            console.log('Barcode scanned:', result.getText());
            this.scanning = false;
            controls.stop();
            this.onBarcodeScanned(result.getText());
          }
        }
      );
    } catch (err) {
      console.error('Scanner failed to start:', err);
    }
  }


  // Capture the current frame from the video element
  captureFrame(): void {
    if (!this.videoElement || !this.videoElement.nativeElement) {
      console.error('Video element not found');
      return;
    }

    try {
      const video = this.videoElement.nativeElement;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        this.lastFrameUrl = canvas.toDataURL('image/png');
        console.log('Frame captured successfully');
      }
    } catch (error) {
      console.error('Error capturing frame:', error);
    }
  }

  onBarcodeScanned(code: string): void {
    console.log('Barcode scanned:', code);

    // Capture the current frame before processing the barcode
    this.captureFrame();

    // First check if the barcode exists in the database
    const barcodeNumber = parseInt(code, 10);
    if (!isNaN(barcodeNumber)) {
      this.foodService.getFoodDataFromBarcodeFromDatabase(barcodeNumber).subscribe({
        next: (foodData: FoodData) => {
          if (foodData) {
            console.log('Food data found in database:', foodData);
            // Navigate to view-food-item page with the found food data and meal ID
            this.router.navigate(['/view-food-item'], {
              state: {
                foodItem: foodData,
                mealId: this.mealId
              }
            });
          } else {
            // If not found in database, search from API
            this.searchFoodFromApi(code);
          }
        },
        error: (error) => {
          console.error('Error checking database for barcode:', error);
          // If error occurs when checking database, try API
          this.searchFoodFromApi(code);
        }
      });
    } else {
      // If barcode is not a valid number, try API directly
      this.searchFoodFromApi(code);
    }
  }

  restartScanning(): void {
    this.scanning = true;
    this.scannedFood = null; // Reset scanned food to show scanner UI

    if (this.controls) {
      this.controls.stop(); // Stop current scanning session
    }

    // Small delay to ensure everything is reset properly
    setTimeout(() => {
      this.startBarcodeScanner(); // Restart scanner
    }, 100);
  }

  // Navigate back to the previous page
  goBack(): void {
    this.location.back();
  }

  // Add the scanned food to the meal tracker
  addToMeal(): void {
    if (this.scannedFood) {
      // Get the current date in the format expected by the backend
      const currentDate = new Date();

      // Get the user ID and add the food to the tracker
      this.foodService.getUserId().subscribe({
        next: (userId: number) => {
          if (userId <= 0) {
            console.error('User ID not available. Please log in again.');
            return;
          }

          // Calculate nutrition values based on user-input amount
          const ratio = this.foodAmount / 100; // Nutrition values are per 100g

          // Create the logger data object
          const loggerData = {
            id: undefined,
            user_id: userId,
            date: currentDate,
            food_id: this.scannedFood!.id,
            food_name: this.scannedFood!.name,
            meal: this.mealId, // Use the meal ID from the router state
            weight: this.foodAmount, // Use user-input amount
            calories: Math.round(this.scannedFood!.calories * ratio),
            carbs: Math.round(this.scannedFood!.carbs * ratio * 10) / 10,
            fats: Math.round(this.scannedFood!.fats * ratio * 10) / 10,
            protein: Math.round(this.scannedFood!.protein * ratio * 10) / 10
          };

          // Add the food to the tracker
          this.foodService.addFoodToTracker(loggerData).subscribe({
            next: (response) => {
              console.log('Food added to tracker successfully:', response);

              // Get today's date in the format YYYY-MM-DD
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const day = String(today.getDate()).padStart(2, '0');
              const todayFormatted = `${year}-${month}-${day}`;

              // Clear the food tracking cache for today to ensure fresh data
              this.foodService.clearFoodTrackingCache(todayFormatted);

              // Navigate to the food tracker
              this.router.navigate(['/food-tracker/:id']);
            },
            error: (error) => {
              console.error('Error adding food to tracker:', error);
              // Still navigate back to avoid user being stuck
              this.goBack();
            }
          });
        },
        error: (error) => {
          console.error('Error getting user ID:', error);
          this.goBack();
        }
      });
    }
  }

  // Helper method to search food from API
  private searchFoodFromApi(code: string): void {
    this.foodService.getFoodDataFromBarcode(code).subscribe({
      next: (foodData: FoodData) => {
        this.scannedFood = foodData;
        console.log('Food data fetched from API:', foodData);

        // Save the base food details (per 100g) to the database for future use
        this.foodService.addFoodItemToDatabase(foodData).subscribe({
          next: (response) => {
            console.log('Food data saved to database:', response);
            // Update the scanned food with the database ID if available
            if (response && response.id) {
              this.scannedFood = { ...this.scannedFood!, id: response.id };
            }
          },
          error: (error) => {
            console.error('Error saving food data to database:', error);
            // Continue with the scanned food even if saving to database fails
          }
        });
      },
      error: (error) => {
        console.error('Error fetching food data from API:', error);
        this.restartScanning();
      }
    });
  }

}
