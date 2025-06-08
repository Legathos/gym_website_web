import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Location } from '@angular/common';
import { FoodData, FoodService } from '@domain/food';
import {BarcodeFormat, BrowserMultiFormatReader, IScannerControls} from "@zxing/browser";
import { Result } from '@zxing/library';

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
  scanner: BrowserMultiFormatReader = new BrowserMultiFormatReader();
  scanning = true;
  controls: IScannerControls | null = null;

  constructor(
    private location: Location,
    private foodService: FoodService
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


  onBarcodeScanned(code: string): void {
    console.log('Barcode scanned:', code);
    this.foodService.getFoodDataFromBarcode(code).subscribe({
      next: (foodData: FoodData) => {
        this.scannedFood = foodData;
        console.log('Food data fetched from barcode:', foodData);
      },
      error: (error) => {
        console.error('Error fetching food data from barcode:', error);
        this.restartScanning();
      }
    });
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
      this.goBack();
    }
  }

}
