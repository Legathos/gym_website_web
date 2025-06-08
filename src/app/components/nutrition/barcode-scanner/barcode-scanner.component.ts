import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Location } from '@angular/common';
import { FoodData } from '@domain/food';
import {BarcodeFormat, BrowserMultiFormatReader, IScannerControls} from "@zxing/browser";
import { Result, DecodeHintType } from '@zxing/library';

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
  scanner: BrowserMultiFormatReader = new BrowserMultiFormatReader(
    new Map([
      [
        DecodeHintType.POSSIBLE_FORMATS,
        [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_39,
          BarcodeFormat.CODE_128,
          BarcodeFormat.QR_CODE
        ]
      ]
    ])
  );
  scanning = true;
  controls: IScannerControls | null = null;

  constructor(
    private location: Location,
  ) {}

  async ngOnInit() {
    // Camera is now initialized in startBarcodeScanner
    this.startBarcodeScanner();
  }

  ngOnDestroy(): void {
    this.scanning = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  async startBarcodeScanner() {
    console.log('Starting scanner...');
    try {
      // Make sure video is ready
      if (!this.videoElement || !this.videoElement.nativeElement) {
        console.error('Video element not found');
        return;
      }

      // Set video constraints for better barcode detection
      const constraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment' // Use back camera on mobile devices
      };

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: constraints
        });
        this.videoElement.nativeElement.srcObject = this.stream;
      } catch (err) {
        console.error('Error accessing camera with constraints:', err);
        // Fallback to basic video
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.videoElement.nativeElement.srcObject = this.stream;
      }

      console.log('Camera started, initializing barcode scanner...');
      this.controls = await this.scanner.decodeFromVideoDevice(
        undefined,
        this.videoElement.nativeElement,
        (result: Result | undefined, error, controls: IScannerControls) => {
          if (error) {
            console.log('Scanning error:', error);
            return;
          }

          console.log('Scanning...');
          if (result && this.scanning) {
            console.log('Scanned code:', result.getText());
            this.scanning = false;
            controls.stop();
            this.onBarcodeScanned(result.getText());
          }
        }
      );
      console.log('Barcode scanner initialized successfully');
    } catch (err) {
      console.error('Scanner failed to start:', err);
    }
  }


  onBarcodeScanned(code: string): void {
    console.log('Scanned code:', code);
  }

  restartScanning(): void {
  }

  // startCamera method removed as it's now handled in startBarcodeScanner

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
