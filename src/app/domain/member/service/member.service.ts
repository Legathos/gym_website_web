import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {EndpointDictionary} from "../../../../environments/endpoint-dictionary";
import {JwtService} from "@core/auth";
import {CookieService} from "ngx-cookie-service";
import {Chart} from "chart.js";
import {UserWeightData} from "../../../../data/userweight.data";
import {User, UserService} from '@domain/user';

@Injectable()
export class MemberService {
  user!: User;
  private weightChartInstance: Chart | null = null;

  constructor(private userService: UserService,
              private http: HttpClient,
              private jwtService: JwtService,
              private cookieService: CookieService
  ) {
  }

  registerUser(user: User): Observable<any> {
    return this.http.post(EndpointDictionary.register, user);
  }

  getUserData() {
    let username = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).username;
    return this.userService.getUserByUsername(username);
  }

  getUserId(): Observable<number> {
    return this.getUserData().pipe(
      map((data) => {
        this.user = data;
        return this.user.id;
      })
    );
  }

  getUsername(){
    return this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).username;
    }

  getUserWeightHistoryData(id: number) {
    return this.userService.getUserWeightHistory(id)
  }

  weightChart(userWeightHistory: UserWeightData[]) {
    // Sort the weight history data by date
    const data = [...userWeightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Get the canvas element
    const canvas = <HTMLCanvasElement>document.getElementById('weight-chart');
    if (!canvas) {
      console.warn('Weight chart canvas not found');
      return;
    }

    // Destroy existing chart if it exists
    if (this.weightChartInstance) {
      this.weightChartInstance.destroy();
    }

    // Create new chart
    this.weightChartInstance = new Chart(
      canvas,
      {
        type: 'line',
        data: {
          labels: data.map(row => row.date.toString().slice(0, 10)),
          datasets: [
            {
              label: 'Weight (Kg)',
              data: data.map(row => row.weight),
              backgroundColor: 'rgba(37, 106, 122, 0.2)', // secondary-color with transparency
              borderColor: '#256A7A', // secondary-color
              borderWidth: 2,
              pointBackgroundColor: '#256A7A',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#256A7A',
              pointRadius: 5,
              pointHoverRadius: 7,
              tension: 0.3, // Smooth curve
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
              position: 'top',
              labels: {
                font: {
                  family: 'Arial, sans-serif',
                  size: 14
                },
                color: '#1E314A' // primary-color
              }
            },
            tooltip: {
              backgroundColor: 'rgba(30, 49, 74, 0.8)', // primary-color with transparency
              titleFont: {
                family: 'Arial, sans-serif',
                size: 14
              },
              bodyFont: {
                family: 'Arial, sans-serif',
                size: 13
              },
              padding: 10,
              cornerRadius: 6,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return `Weight: ${context.parsed.y} Kg`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#1E314A', // primary-color
                font: {
                  family: 'Arial, sans-serif'
                }
              },
              title: {
                display: false,
                text: 'Date',
                color: '#1E314A', // primary-color
                font: {
                  family: 'Arial, sans-serif',
                  size: 14,
                  weight: 'bold'
                }
              }
            },
            y: {
              grid: {
                color: 'rgba(197, 228, 233, 0.3)' // tertiary-color with transparency
              },
              ticks: {
                color: '#1E314A', // primary-color
                font: {
                  family: 'Arial, sans-serif'
                }
              },
              title: {
                display: true,
                text: 'Weight (Kg)',
                color: '#1E314A', // primary-color
                font: {
                  family: 'Arial, sans-serif',
                  size: 14,
                  weight: 'bold'
                }
              }
            }
          },
          animation: {
            duration: 2000,
            easing: 'easeOutQuart'
          },
          elements: {
            line: {
              borderJoinStyle: 'round'
            }
          },
          interaction: {
            mode: 'index',
            intersect: false
          }
        }
      }
    );

    return this.weightChartInstance;
  }
}
