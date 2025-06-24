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

  // Default meal ID (1 = breakfast)
  mealId: number = 1;

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
      // Navigate to add-food component with scanned food data and meal ID
      this.router.navigate(['/add-food'], {
        state: {
          foodData: this.scannedFood,
          mealId: this.mealId
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
      },
      error: (error) => {
        console.error('Error fetching food data from API:', error);
        this.restartScanning();
      }
    });
  }

}
