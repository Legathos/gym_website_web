import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FoodService} from "@domain/food";
import { LoggerData} from "@domain/food/model/logger.model";
import {Router} from "@angular/router";
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

// Declare the bootstrap global variable for TypeScript
declare global {
  interface Window {
    bootstrap: any;
  }
}
const bootstrap = window.bootstrap;

@Component({
  selector: 'app-food-tracker',
  templateUrl: './food-tracker.component.html',
  styleUrl: './food-tracker.component.scss'
})
export class FoodTrackerComponent implements OnInit, AfterViewInit {
  @ViewChild('proteinHistoryChart') proteinHistoryChartRef!: ElementRef;

  foodLogs: LoggerData[] = [];
  breakfastLogs: LoggerData[] = [];
  lunchLogs: LoggerData[] = [];
  dinnerLogs: LoggerData[] = [];
  protein = 0;
  carbs = 0;
  fats = 0;
  calories = this.protein * 4 + this.carbs * 4 + this.fats * 9;

  // Properties for protein history chart
  proteinHistoryChart!: Chart;
  proteinHistoryData: {date: string, protein: number}[] = [];

  // Period selection for protein history chart
  selectedPeriod: number = 7; // Default to 1 week (7 days)
  periodOptions = [
    { label: '1 Week', days: 7 },
    { label: '2 Weeks', days: 14 },
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 }
  ];

  // Macros for each meal type
  breakfastProtein = 0;
  breakfastCarbs = 0;
  breakfastFats = 0;
  breakfastCalories = 0;

  lunchProtein = 0;
  lunchCarbs = 0;
  lunchFats = 0;
  lunchCalories = 0;

  dinnerProtein = 0;
  dinnerCarbs = 0;
  dinnerFats = 0;
  dinnerCalories = 0;
  date:string = this.getTodayDate()

  // Track the currently expanded item
  currentlyExpandedItem: string | null = null;

  constructor(
    private foodService: FoodService,
    private router: Router,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    // Get today's food logs
    this.foodService.getFoodTrackingByIdAndDate(this.date).subscribe(data => {
      this.foodLogs = data;
      if (this.foodLogs) {
        // Group food logs by meal type
        this.groupFoodLogsByMealType();
        this.calculateTotalCalories();
        this.calculateMacros();
        // Calculate macros for each meal type
        this.calculateBreakfastMacros();
        this.calculateLunchMacros();
        this.calculateDinnerMacros();
      }
    });

    // Get protein intake history for the past 7 days
    this.loadProteinHistory();
  }

  groupFoodLogsByMealType(): void {
    // Clear existing arrays
    this.breakfastLogs = [];
    this.lunchLogs = [];
    this.dinnerLogs = [];

    // Group food logs by meal ID (1=breakfast, 2=lunch, 3=dinner)
    for (const log of this.foodLogs) {
      if (!log.meal || log.meal === 1) {
        this.breakfastLogs.push(log);
      } else if (log.meal === 2) {
        this.lunchLogs.push(log);
      } else if (log.meal === 3) {
        this.dinnerLogs.push(log);
      }
    }
  }

  calculateTotalCalories() {
    for (const log of this.foodLogs) {
      this.calories += log.calories;
    }
  }

  calculateMacros(){
    for (const log of this.foodLogs){
      this.protein+=log.protein;
      this.carbs+=log.carbs;
      this.fats+=log.fats;
    }
  }

  calculateBreakfastMacros() {
    // Reset values
    this.breakfastProtein = 0;
    this.breakfastCarbs = 0;
    this.breakfastFats = 0;
    this.breakfastCalories = 0;

    // Calculate macros for breakfast
    for (const log of this.breakfastLogs) {
      this.breakfastProtein += log.protein;
      this.breakfastCarbs += log.carbs;
      this.breakfastFats += log.fats;
      this.breakfastCalories += log.calories;
    }
  }

  calculateLunchMacros() {
    // Reset values
    this.lunchProtein = 0;
    this.lunchCarbs = 0;
    this.lunchFats = 0;
    this.lunchCalories = 0;

    // Calculate macros for lunch
    for (const log of this.lunchLogs) {
      this.lunchProtein += log.protein;
      this.lunchCarbs += log.carbs;
      this.lunchFats += log.fats;
      this.lunchCalories += log.calories;
    }
  }

  calculateDinnerMacros() {
    // Reset values
    this.dinnerProtein = 0;
    this.dinnerCarbs = 0;
    this.dinnerFats = 0;
    this.dinnerCalories = 0;

    // Calculate macros for dinner
    for (const log of this.dinnerLogs) {
      this.dinnerProtein += log.protein;
      this.dinnerCarbs += log.carbs;
      this.dinnerFats += log.fats;
      this.dinnerCalories += log.calories;
    }
  }

  addItem(meal: number) {
    // Navigate to food search with meal ID parameter
    this.router.navigate(['/food-search'], { state: { mealId: meal } });
  }

  editLogItem(logItem: LoggerData) {
    // Navigate to view-log-item page with the log item data for viewing/editing
    this.router.navigate(['/view-log-item'], {
      state: {
        logItem: logItem
      }
    });
  }

  deleteLogItem(logItem: LoggerData) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { question: 'Are you sure you want to delete this food log?', action: 'Delete' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.foodService.deleteFoodLog(logItem).subscribe({
          next: () => {
            // Refresh the food logs after deletion
            this.foodService.getFoodTrackingByIdAndDate(this.date).subscribe(data => {
              this.foodLogs = data;
              // Reset all values
              this.protein = 0;
              this.carbs = 0;
              this.fats = 0;
              this.calories = 0;

              // Recalculate everything
              this.groupFoodLogsByMealType();
              this.calculateTotalCalories();
              this.calculateMacros();
              this.calculateBreakfastMacros();
              this.calculateLunchMacros();
              this.calculateDinnerMacros();
            });
          },
          error: (error) => {
            console.error('Error deleting food log:', error);
            alert('Failed to delete food log. Please try again.');
          }
        });
      }
    });
  }

  /**
   * Returns today's date in the format YYYY-MM-DD using local timezone
   */
  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Loads protein intake history for the selected period
   */
  loadProteinHistory(): void {
    this.foodService.getProteinIntakeHistory(this.selectedPeriod).subscribe({
      next: (data) => {
        // Sort data by date (oldest to newest)
        this.proteinHistoryData = data.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // If view is already initialized, create the chart
        if (this.proteinHistoryChartRef) {
          this.createProteinHistoryChart();
        }
      },
      error: (error) => {
        console.error('Error loading protein history:', error);
      }
    });
  }

  /**
   * After view is initialized, create the protein history chart if data is available
   */
  ngAfterViewInit(): void {
    if (this.proteinHistoryData.length > 0) {
      this.createProteinHistoryChart();
    }
  }

  /**
   * Creates the protein history bar chart
   */
  createProteinHistoryChart(): void {
    // If chart already exists, destroy it first
    if (this.proteinHistoryChart) {
      this.proteinHistoryChart.destroy();
    }

    // Get the canvas element
    const canvas = this.proteinHistoryChartRef?.nativeElement;
    if (!canvas) {
      console.warn('Protein history chart canvas not found');
      return;
    }

    // Format dates for display based on the selected period
    // Check if data spans multiple years for longer periods
    let spansMultipleYears = false;
    if (this.selectedPeriod > 90 && this.proteinHistoryData.length > 1) {
      const years = new Set(
        this.proteinHistoryData.map(item => new Date(item.date).getFullYear())
      );
      spansMultipleYears = years.size > 1;
    }

    const labels = this.proteinHistoryData.map(item => {
      const date = new Date(item.date);

      // For periods longer than 2 weeks, use a different date format
      if (this.selectedPeriod > 14) {
        if (spansMultipleYears) {
          // If data spans multiple years, include the year (e.g., "Jan 15, 2023")
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
          });
        } else {
          // For longer periods in the same year, show month and day (e.g., "Jan 15")
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      } else {
        // For shorter periods, show day of week and day (e.g., "Mon 15")
        const day = date.getDate();
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        return `${dayName} ${day}`;
      }
    });

    // Get protein values
    const proteinValues = this.proteinHistoryData.map(item => item.protein);

    // Create gradient for bars
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(78, 42, 132, 1)');     // Deep purple at top
    gradient.addColorStop(1, 'rgba(125, 44, 250, 0.6)');  // Lighter purple at bottom

    // Create the chart
    this.proteinHistoryChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Protein (g)',
          data: proteinValues,
          backgroundColor: gradient,
          borderColor: 'rgba(78, 42, 132, 0.8)',
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(125, 44, 250, 0.9)',
          barPercentage: 0.7,
          categoryPercentage: 0.8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1500,
          easing: 'easeOutQuart'
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(200, 200, 200, 0.1)',
            },
            ticks: {
              font: {
                family: "'Roboto', sans-serif",
                size: 12
              },
              color: 'rgba(100, 100, 100, 0.8)'
            },
            title: {
              display: true,
              text: 'Protein (g)',
              font: {
                family: "'Roboto', sans-serif",
                size: 14,
                weight: 'bold'
              },
              color: 'rgba(80, 80, 80, 1)'
            }
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                family: "'Roboto', sans-serif",
                size: 12
              },
              color: 'rgba(100, 100, 100, 0.8)',
              maxRotation: 45,
              minRotation: 0,
              autoSkip: true,
              autoSkipPadding: 10,
              // For longer periods, limit the number of ticks to avoid overcrowding
              maxTicksLimit: this.selectedPeriod > 90 ? 12 : (this.selectedPeriod > 30 ? 15 : undefined)
            },
            title: {
              display: true,
              text: 'Date',
              font: {
                family: "'Roboto', sans-serif",
                size: 14,
                weight: 'bold'
              },
              color: 'rgba(80, 80, 80, 1)'
            }
          }
        },
        plugins: {
          title: {
            display: false, // We're using a custom title in the HTML
            font: {
              family: "'Roboto', sans-serif",
              size: 18,
              weight: 'bold'
            },
            color: 'rgba(60, 60, 60, 1)',
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: 'rgba(60, 60, 60, 1)',
            bodyColor: 'rgba(60, 60, 60, 1)',
            titleFont: {
              family: "'Roboto', sans-serif",
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              family: "'Roboto', sans-serif",
              size: 13
            },
            padding: 12,
            boxPadding: 6,
            borderColor: 'rgba(200, 200, 200, 0.5)',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              title: (tooltipItems) => {
                return `${tooltipItems[0].label}`;
              },
              label: (context) => {
                return `Protein: ${context.parsed.y}g`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Changes the selected period for protein history chart and reloads the data
   * @param days Number of days to display in the chart
   */
  changePeriod(days: number): void {
    if (this.selectedPeriod !== days) {
      this.selectedPeriod = days;
      this.loadProteinHistory();
    }
  }

  /**
   * Toggles the expansion state of a food item detail section.
   * Ensures only one item is expanded at a time by collapsing the previously expanded item.
   * @param itemId The ID of the item to toggle
   */
  toggleItemDetails(itemId: string): void {
    // If the clicked item is already expanded, collapse it
    if (this.currentlyExpandedItem === itemId) {
      this.currentlyExpandedItem = null;
      // Use Bootstrap's collapse API to hide the element
      const collapseElement = document.getElementById(itemId);
      if (collapseElement) {
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
        bsCollapse.hide();
      }
    } else {
      // If another item is currently expanded, collapse it first
      if (this.currentlyExpandedItem) {
        const previousElement = document.getElementById(this.currentlyExpandedItem);
        if (previousElement) {
          const bsCollapse = new bootstrap.Collapse(previousElement, { toggle: false });
          bsCollapse.hide();
        }
      }

      // Expand the clicked item
      this.currentlyExpandedItem = itemId;
      const newElement = document.getElementById(itemId);
      if (newElement) {
        const bsCollapse = new bootstrap.Collapse(newElement, { toggle: false });
        bsCollapse.show();
      }
    }
  }
}
