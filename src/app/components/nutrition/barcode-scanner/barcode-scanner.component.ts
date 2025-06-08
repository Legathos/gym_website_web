import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Location } from '@angular/common';
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


  constructor(
    private location: Location,
  ) {}

  async ngOnInit() {
    await this.startCamera();
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
