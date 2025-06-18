import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {User} from "@domain/user";
import {UserWeightData} from "../../../data/userweight.data";
import {MemberService} from "@domain/member";
import {FoodService} from "@domain/food";
import { LoggerData} from "@domain/food/model/logger.model";
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('proteinHistoryChart') proteinHistoryChartRef!: ElementRef;
  @ViewChild('caloriesHistoryChart') caloriesHistoryChartRef!: ElementRef;
  @ViewChild('carbsHistoryChart') carbsHistoryChartRef!: ElementRef;
  @ViewChild('fatHistoryChart') fatHistoryChartRef!: ElementRef;

  username!: string;
  user!: User;
  userWeightHistory!: UserWeightData[];

  // Food tracking data
  foodLogs: LoggerData[] = [];
  protein = 0;
  carbs = 0;
  fats = 0;
  calories = 0;
  date: string = new Date().toISOString().slice(0,10);

  // Properties for protein history chart
  proteinHistoryChart!: Chart;
  proteinHistoryData: {date: string, protein: number}[] = [];

  // Properties for calories history chart
  caloriesHistoryChart!: Chart;
  caloriesHistoryData: {date: string, calories: number}[] = [];

  // Properties for carbs history chart
  carbsHistoryChart!: Chart;
  carbsHistoryData: {date: string, carbs: number}[] = [];

  // Properties for fat history chart
  fatHistoryChart!: Chart;
  fatHistoryData: {date: string, fat: number}[] = [];

  // Period selection for history charts
  caloriesSelectedPeriod: number = 7; // Default to 1 week (7 days)
  proteinSelectedPeriod: number = 7; // Default to 1 week (7 days)
  carbsSelectedPeriod: number = 7; // Default to 1 week (7 days)
  fatSelectedPeriod: number = 7; // Default to 1 week (7 days)

  periodOptions = [
    { label: '1 Week', days: 7 },
    { label: '2 Weeks', days: 14 },
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 }
  ];

  constructor(
    private memberService: MemberService,
    private foodService: FoodService
  ) {
  }

  ngOnInit() {
    this.getUserData();
    this.getFoodTrackingData();

    // Load history data for charts
    this.loadCaloriesHistory();
    this.loadProteinHistory();
    this.loadCarbsHistory();
    this.loadFatHistory();
  }

  ngAfterViewInit() {
    // Create charts if data is already loaded
    if (this.caloriesHistoryData.length > 0) {
      this.createCaloriesHistoryChart();
    }
    if (this.proteinHistoryData.length > 0) {
      this.createProteinHistoryChart();
    }
    if (this.carbsHistoryData.length > 0) {
      this.createCarbsHistoryChart();
    }
    if (this.fatHistoryData.length > 0) {
      this.createFatHistoryChart();
    }
  }

  getUserData() {
    this.memberService.getUserData().subscribe({
      next: (data) => {
        this.user = data;
        this.getUserWeightHistoryData(this.user.id);
      }
    });
  }

  getUserWeightHistoryData(id: number) {
    this.memberService.getUserWeightHistoryData(id)
      .subscribe({
        next: (data) => {
          this.userWeightHistory = data;
          this.memberService.weightChart(this.userWeightHistory)
        }
      })
  }

  getFoodTrackingData() {
    this.foodService.getFoodTrackingByIdAndDate(this.date).subscribe({
      next: (data) => {
        this.foodLogs = data;
        // Always calculate values and create chart, even if there's no data
        this.calculateTotalCalories();
        this.calculateMacros();
        // Create the donut chart for macros
        setTimeout(() => {
          this.foodService.macrosChart(this.protein, this.carbs, this.fats);
        }, 100);
      }
    });
  }

  calculateTotalCalories() {
    this.calories = 0;
    for (const log of this.foodLogs) {
      this.calories += log.calories;
    }
  }

  calculateMacros() {
    this.protein = 0;
    this.carbs = 0;
    this.fats = 0;
    for (const log of this.foodLogs) {
      this.protein += log.protein;
      this.carbs += log.carbs;
      this.fats += log.fats;
    }
  }

  /**
   * Loads calories intake history for the selected period
   */
  loadCaloriesHistory(): void {
    this.foodService.getCaloriesIntakeHistory(this.caloriesSelectedPeriod).subscribe({
      next: (data) => {
        // Sort data by date (oldest to newest)
        this.caloriesHistoryData = data.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // If view is already initialized, create the chart
        if (this.caloriesHistoryChartRef) {
          this.createCaloriesHistoryChart();
        }
      },
      error: (error) => {
        console.error('Error loading calories history:', error);
      }
    });
  }

  /**
   * Loads protein intake history for the selected period
   */
  loadProteinHistory(): void {
    this.foodService.getProteinIntakeHistory(this.proteinSelectedPeriod).subscribe({
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
   * Loads carbs intake history for the selected period
   */
  loadCarbsHistory(): void {
    this.foodService.getCarbsIntakeHistory(this.carbsSelectedPeriod).subscribe({
      next: (data) => {
        // Sort data by date (oldest to newest)
        this.carbsHistoryData = data.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // If view is already initialized, create the chart
        if (this.carbsHistoryChartRef) {
          this.createCarbsHistoryChart();
        }
      },
      error: (error) => {
        console.error('Error loading carbs history:', error);
      }
    });
  }

  /**
   * Loads fat intake history for the selected period
   */
  loadFatHistory(): void {
    this.foodService.getFatIntakeHistory(this.fatSelectedPeriod).subscribe({
      next: (data) => {
        // Sort data by date (oldest to newest)
        this.fatHistoryData = data.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // If view is already initialized, create the chart
        if (this.fatHistoryChartRef) {
          this.createFatHistoryChart();
        }
      },
      error: (error) => {
        console.error('Error loading fat history:', error);
      }
    });
  }

  /**
   * Changes the selected period for a specific history chart and reloads the data
   * @param days Number of days to display in the chart
   * @param chartType Type of chart to update ('calories', 'protein', 'carbs', 'fat')
   */
  changePeriod(days: number, chartType: 'calories' | 'protein' | 'carbs' | 'fat'): void {
    switch (chartType) {
      case 'calories':
        if (this.caloriesSelectedPeriod !== days) {
          this.caloriesSelectedPeriod = days;
          this.loadCaloriesHistory();
        }
        break;
      case 'protein':
        if (this.proteinSelectedPeriod !== days) {
          this.proteinSelectedPeriod = days;
          this.loadProteinHistory();
        }
        break;
      case 'carbs':
        if (this.carbsSelectedPeriod !== days) {
          this.carbsSelectedPeriod = days;
          this.loadCarbsHistory();
        }
        break;
      case 'fat':
        if (this.fatSelectedPeriod !== days) {
          this.fatSelectedPeriod = days;
          this.loadFatHistory();
        }
        break;
    }
  }

  /**
   * Creates the calories history bar chart
   */
  createCaloriesHistoryChart(): void {
    // If chart already exists, destroy it first
    if (this.caloriesHistoryChart) {
      this.caloriesHistoryChart.destroy();
    }

    // Get the canvas element
    const canvas = this.caloriesHistoryChartRef?.nativeElement;
    if (!canvas) {
      console.warn('Calories history chart canvas not found');
      return;
    }

    // Format dates for display based on the selected period
    // Check if data spans multiple years for longer periods
    let spansMultipleYears = false;
    if (this.caloriesSelectedPeriod > 90 && this.caloriesHistoryData.length > 1) {
      const years = new Set(
        this.caloriesHistoryData.map(item => new Date(item.date).getFullYear())
      );
      spansMultipleYears = years.size > 1;
    }

    const labels = this.caloriesHistoryData.map(item => {
      const date = new Date(item.date);

      // For periods longer than 2 weeks, use a different date format
      if (this.caloriesSelectedPeriod > 14) {
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

    // Get calories values
    const caloriesValues = this.caloriesHistoryData.map(item => item.calories);

    // Create gradient for bars
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(255, 99, 71, 1)');     // Tomato red at top
    gradient.addColorStop(1, 'rgba(255, 165, 0, 0.6)');   // Orange at bottom

    // Create the chart
    this.caloriesHistoryChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Calories (kcal)',
          data: caloriesValues,
          backgroundColor: gradient,
          borderColor: 'rgba(255, 99, 71, 0.8)',
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(255, 99, 71, 0.9)',
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
              text: 'Calories (kcal)',
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
              maxTicksLimit: this.caloriesSelectedPeriod > 90 ? 12 : (this.caloriesSelectedPeriod > 30 ? 15 : undefined)
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
                return `Calories: ${context.parsed.y} kcal`;
              }
            }
          }
        }
      }
    });
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
    if (this.proteinSelectedPeriod > 90 && this.proteinHistoryData.length > 1) {
      const years = new Set(
        this.proteinHistoryData.map(item => new Date(item.date).getFullYear())
      );
      spansMultipleYears = years.size > 1;
    }

    const labels = this.proteinHistoryData.map(item => {
      const date = new Date(item.date);

      // For periods longer than 2 weeks, use a different date format
      if (this.proteinSelectedPeriod > 14) {
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
              maxTicksLimit: this.proteinSelectedPeriod > 90 ? 12 : (this.proteinSelectedPeriod > 30 ? 15 : undefined)
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
   * Creates the carbs history bar chart
   */
  createCarbsHistoryChart(): void {
    // If chart already exists, destroy it first
    if (this.carbsHistoryChart) {
      this.carbsHistoryChart.destroy();
    }

    // Get the canvas element
    const canvas = this.carbsHistoryChartRef?.nativeElement;
    if (!canvas) {
      console.warn('Carbs history chart canvas not found');
      return;
    }

    // Format dates for display based on the selected period
    // Check if data spans multiple years for longer periods
    let spansMultipleYears = false;
    if (this.carbsSelectedPeriod > 90 && this.carbsHistoryData.length > 1) {
      const years = new Set(
        this.carbsHistoryData.map(item => new Date(item.date).getFullYear())
      );
      spansMultipleYears = years.size > 1;
    }

    const labels = this.carbsHistoryData.map(item => {
      const date = new Date(item.date);

      // For periods longer than 2 weeks, use a different date format
      if (this.carbsSelectedPeriod > 14) {
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

    // Get carbs values
    const carbsValues = this.carbsHistoryData.map(item => item.carbs);

    // Create gradient for bars
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 123, 255, 1)');     // Blue at top
    gradient.addColorStop(1, 'rgba(54, 162, 235, 0.6)');  // Lighter blue at bottom

    // Create the chart
    this.carbsHistoryChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Carbs (g)',
          data: carbsValues,
          backgroundColor: gradient,
          borderColor: 'rgba(0, 123, 255, 0.8)',
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(54, 162, 235, 0.9)',
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
              text: 'Carbs (g)',
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
              maxTicksLimit: this.carbsSelectedPeriod > 90 ? 12 : (this.carbsSelectedPeriod > 30 ? 15 : undefined)
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
                return `Carbs: ${context.parsed.y}g`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Creates the fat history bar chart
   */
  createFatHistoryChart(): void {
    // If chart already exists, destroy it first
    if (this.fatHistoryChart) {
      this.fatHistoryChart.destroy();
    }

    // Get the canvas element
    const canvas = this.fatHistoryChartRef?.nativeElement;
    if (!canvas) {
      console.warn('Fat history chart canvas not found');
      return;
    }

    // Format dates for display based on the selected period
    // Check if data spans multiple years for longer periods
    let spansMultipleYears = false;
    if (this.fatSelectedPeriod > 90 && this.fatHistoryData.length > 1) {
      const years = new Set(
        this.fatHistoryData.map(item => new Date(item.date).getFullYear())
      );
      spansMultipleYears = years.size > 1;
    }

    const labels = this.fatHistoryData.map(item => {
      const date = new Date(item.date);

      // For periods longer than 2 weeks, use a different date format
      if (this.fatSelectedPeriod > 14) {
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

    // Get fat values
    const fatValues = this.fatHistoryData.map(item => item.fat);

    // Create gradient for bars
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(255, 193, 7, 1)');     // Yellow at top
    gradient.addColorStop(1, 'rgba(255, 205, 86, 0.6)');  // Lighter yellow at bottom

    // Create the chart
    this.fatHistoryChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Fat (g)',
          data: fatValues,
          backgroundColor: gradient,
          borderColor: 'rgba(255, 193, 7, 0.8)',
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(255, 205, 86, 0.9)',
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
              text: 'Fat (g)',
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
              maxTicksLimit: this.fatSelectedPeriod > 90 ? 12 : (this.fatSelectedPeriod > 30 ? 15 : undefined)
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
                return `Fat: ${context.parsed.y}g`;
              }
            }
          }
        }
      }
    });
  }
}
