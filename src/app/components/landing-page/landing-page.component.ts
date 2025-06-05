import { Component, OnInit, OnDestroy } from '@angular/core';
import 'hammerjs';


@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements OnInit, OnDestroy {

  currentSlide = 0;
  autoSlideInterval: any;
  autoSlideDelay = 5000; // 5 seconds between slides
  isAnimating = true; // Flag to control animation

  features = [
    {
      title: '💪 Exercise Library',
      description: 'Explore a wide variety of exercises with full instructions and form tips.'
    },
    {
      title: '📊 Progress Tracking',
      description: 'Save your routines, follow your journey, and view statistics.'
    },
    {
      title: '🥗 Nutrition Planner',
      description: 'Choose from a library of foods with accurate nutritional info.'
    },
    {
      title: '⚖️ Smart Goals',
      description: 'Tailor your plan with smart daily tracking tools.'
    }
  ];

  ngOnInit(): void {
    // Initialize with the first actual slide (index 1 because of the cloned slide at index 0)
    this.currentSlide = 1;
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.stopAutoSlide(); // Clear any existing interval
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoSlideDelay);
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  goToSlide(index: number): void {
    // Add 1 to account for the cloned slide at the beginning
    this.currentSlide = index + 1;
    this.resetAutoSlide();
  }

  nextSlide() {
    if (this.currentSlide === this.features.length) {
      // We're at the last slide, prepare to loop back to first
      this.currentSlide = this.features.length + 1; // Go to the cloned first slide
      this.resetAutoSlide();

      // After the transition completes, instantly jump back to the first slide without animation
      setTimeout(() => {
        this.isAnimating = false;
        this.currentSlide = 1; // First actual slide (after the cloned last slide)

        // Re-enable animation after the DOM has updated
        setTimeout(() => {
          this.isAnimating = true;
        }, 50);
      }, 600); // This should match the transition duration in CSS
    } else {
      // Normal slide transition
      this.currentSlide++;
      this.resetAutoSlide();
    }
  }

  prevSlide() {
    if (this.currentSlide === 1) {
      // We're at the first actual slide, prepare to loop back to last
      this.currentSlide = 0; // Go to the cloned last slide
      this.resetAutoSlide();

      // After the transition completes, instantly jump to the last slide without animation
      setTimeout(() => {
        this.isAnimating = false;
        this.currentSlide = this.features.length; // Last actual slide

        // Re-enable animation after the DOM has updated
        setTimeout(() => {
          this.isAnimating = true;
        }, 50);
      }, 600); // This should match the transition duration in CSS
    } else {
      // Normal slide transition
      this.currentSlide--;
      this.resetAutoSlide();
    }
  }

  resetAutoSlide(): void {
    this.stopAutoSlide();
    this.startAutoSlide();
  }
}
