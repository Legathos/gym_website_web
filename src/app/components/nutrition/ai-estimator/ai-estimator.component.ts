import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FoodData, FoodService } from '@domain/food';

@Component({
  selector: 'app-ai-estimator',
  templateUrl: './ai-estimator.component.html',
  styleUrl: './ai-estimator.component.scss'
})
export class AiEstimatorComponent implements OnInit, OnDestroy {
  // This will be populated when a food is estimated by AI
  estimatedFood: FoodData | null = null;

  // Meal ID (1=breakfast, 2=lunch, 3=dinner)
  mealId: number = 1; // Default to breakfast

  @ViewChild('video', {static: true}) videoElement!: ElementRef<HTMLVideoElement>;
  stream: MediaStream | null = null;
  capturedImage: string | null = null;

  constructor(
    private location: Location,
    private router: Router,
    private foodService: FoodService
  ) {
    // Get the meal ID from the navigation state if available
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      const state = navigation.extras.state as { mealId: number };
      if (state.mealId) {
        this.mealId = state.mealId;
      }
    }
  }

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
      // Get the current date in the format expected by the backend
      const currentDate = new Date();

      // Get the user ID and add the food to the tracker
      this.foodService.getUserId().subscribe({
        next: (userId: number) => {
          if (userId <= 0) {
            console.error('User ID not available. Please log in again.');
            return;
          }

          // Create the logger data object
          const loggerData = {
            id: undefined,
            user_id: userId,
            date: currentDate,
            food_id: this.estimatedFood!.id,
            food_name: this.estimatedFood!.name,
            meal: this.mealId, // Use the meal ID from the router state
            weight: this.estimatedFood!.weight,
            calories: this.estimatedFood!.calories,
            carbs: this.estimatedFood!.carbs,
            fats: this.estimatedFood!.fats,
            protein: this.estimatedFood!.protein
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

        // Send the image to the backend for AI analysis
        this.analyzeImageWithAI();
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
    this.estimatedFood = foodData;
  }

  // Send the captured image to the backend for AI analysis
  private analyzeImageWithAI(): void {
    if (!this.capturedImage) {
      console.error('No image captured');
      return;
    }

    // Send the image to the backend for analysis
    this.foodService.estimateFoodFromImage(this.capturedImage).subscribe({
      next: (foodData: FoodData) => {
        console.log('Food estimated from image:', foodData);
        this.onFoodEstimated(foodData);
      },
      error: (error) => {
        console.error('Error estimating food from image:', error);
        // Handle the error properly
        this.handleEstimationError(error);
      }
    });
  }

  // Handle errors during food estimation
  private handleEstimationError(error: any): void {
    console.warn('Food estimation failed:', error);
    // Inform the user about the error
    alert('Unable to estimate food from the image. Please try again or use manual entry.');
    // Reset the UI to allow the user to try again
    this.capturedImage = null;
  }
}
