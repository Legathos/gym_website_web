import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { FoodData } from '@domain/food';

@Component({
  selector: 'app-ai-estimator',
  templateUrl: './ai-estimator.component.html',
  styleUrl: './ai-estimator.component.scss'
})
export class AiEstimatorComponent implements OnInit, OnDestroy {
  // This will be populated when a food is estimated by AI
  estimatedFood: FoodData | null = null;

  @ViewChild('video', {static: true}) videoElement!: ElementRef<HTMLVideoElement>;
  stream: MediaStream | null = null;
  capturedImage: string | null = null;

  constructor(
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.startCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  async startCamera() {
    try {
      console.log('Starting camera...');
      // Make sure video is ready
      if (!this.videoElement || !this.videoElement.nativeElement) {
        console.error('Video element not found');
        return;
      }

      // Set optimized video constraints
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
    } catch (err) {
      console.error('Camera failed to start:', err);
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  // Navigate back to the previous page
  goBack(): void {
    this.location.back();
  }

  // Add the estimated food to the meal tracker
  addToMeal(): void {
    if (this.estimatedFood) {
      // This functionality will be implemented later
      console.log('Adding to meal:', this.estimatedFood);
      // Navigate back or to the food tracker
      this.goBack();
    }
  }

  // Take a photo from the video stream
  takePhoto(): void {
    if (!this.videoElement || !this.videoElement.nativeElement || !this.stream) {
      console.error('Video element or stream not available');
      return;
    }

    try {
      // Create a canvas element to capture the current frame
      const canvas = document.createElement('canvas');
      const video = this.videoElement.nativeElement;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to the canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a data URL (base64 encoded image)
        this.capturedImage = canvas.toDataURL('image/jpeg');

        // Stop the camera after taking the photo
        this.stopCamera();

        // For demo purposes, simulate AI analysis with a mock food item
        // In a real implementation, you would send the image to an AI service
        setTimeout(() => {
          this.simulateAiAnalysis();
        }, 1000);
      }
    } catch (err) {
      console.error('Error taking photo:', err);
    }
  }

  // Restart the camera and clear the current estimation
  restartCamera(): void {
    this.estimatedFood = null;
    this.capturedImage = null;
    this.startCamera();
  }

  // Retake photo (discard current photo and restart camera)
  retakePhoto(): void {
    // Clear both the captured image and estimated food data, then restart the camera
    this.estimatedFood = null;
    this.capturedImage = null;
    this.startCamera();
  }

  // This method will be called when a photo is taken and analyzed
  onFoodEstimated(foodData: FoodData): void {
    // In a real implementation, this would receive data from an AI service
    console.log('Food estimated:', foodData);
    this.estimatedFood = foodData;
  }

  // Simulate AI analysis with a mock food item (for demo purposes)
  private simulateAiAnalysis(): void {
    // Mock food data that would normally come from an AI service
    const mockFoodData: FoodData = {
      id: 1,
      name: 'Student la Politehnica',
      weight: 100,
      calories: 320,
      protein: 35,
      carbs: 10,
      fats: 15,
      barcode: undefined
    };

    this.onFoodEstimated(mockFoodData);
  }
}
