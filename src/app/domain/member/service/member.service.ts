import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";
import {EndpointDictionary} from "../../../../environments/endpoint-dictionary";
import {JwtService} from "@core/auth";
import {CookieService} from "ngx-cookie-service";
import {Chart} from "chart.js";
import {UserWeightData} from "../../../../data/userweight.data";
import {User, UserService} from '@domain/user';

@Injectable()
export class MemberService {
  user!: User;

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

  getUserId(){
    // Check if user is already loaded
    if (!this.user) {
      // If not, try to get from localStorage as a fallback
      const userJson = localStorage.getItem('user');
      if (userJson) {
        this.user = JSON.parse(userJson);
      }
    }

    // If we still don't have a user, trigger the async load for next time
    // but return a default value for now
    if (!this.user) {
      this.getUserData().subscribe({
        next: (data) => {
          this.user = data;
          // Store in localStorage for future use
          localStorage.setItem('user', JSON.stringify(data));
        }
      });
      return 0; // Return a default value or handle the error case
    }

    return this.user.id;
  }

  getUsername(){
    // Check if user is already loaded
    if (!this.user) {
      // If not, try to get from localStorage as a fallback
      const userJson = localStorage.getItem('user');
      if (userJson) {
        this.user = JSON.parse(userJson);
      }
    }

    // If we still don't have a user, trigger the async load for next time
    // but return a default value for now
    if (!this.user) {
      this.getUserData().subscribe({
        next: (data) => {
          this.user = data;
          // Store in localStorage for future use
          localStorage.setItem('user', JSON.stringify(data));
        }
      });
      return ''; // Return a default value or handle the error case
    }

    return this.user.username;
  }

  getUserWeightHistoryData(id: number) {
    return this.userService.getUserWeightHistory(id)
  }

  weightChart(userWeightHistory: UserWeightData[]) {
    const data = userWeightHistory
    new Chart(
      <HTMLCanvasElement>document.getElementById('weight-chart'),
      {
        type: 'line',
        data: {
          labels: data.map(row => row.date.toString().slice(0, 10)),
          datasets: [
            {
              label: 'Weight (kg)',
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
              display: true,
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
                  return `Weight: ${context.parsed.y} kg`;
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
                display: true,
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
                text: 'Weight (kg)',
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
  }
}
