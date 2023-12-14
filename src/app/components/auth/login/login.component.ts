import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "../../../../data/user.data";
import {NgbAlert} from "@ng-bootstrap/ng-bootstrap";
import {NavigationExtras, Router} from "@angular/router";
import {AuthService} from "../../../services/auth.service";
import {CookieService} from "ngx-cookie-service";
import {UserLogin} from "../../../../data/userlogin.data";
import {JwtServiceService} from "../../../services/jwt-service.service";
import {GlobalConstants} from "../../../../data/global-constraints.data";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  user !: User;
  warningMessage !: string;
  alertType !: string;
  hide: boolean = true;
  username!: string;
  href!: string;

  @ViewChild('confirmationMessage', { static: false }) confirmationMessage!: NgbAlert;

  constructor(private router: Router,
              private authService: AuthService,
              private cookieService: CookieService,
              private jwtService: JwtServiceService) { }

  //initialized the login form with empty strings
  initLoginForm() {
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    })
  }

  ngOnInit(): void {
    this.initLoginForm();
  }

  //function to call the login request from backend. Based on the role of the user we navigate to
  // the corresponding page using the navigate function.
  onSubmit() {
    const url = 'http://localhost:8080/user/login'

    this.authService.login<UserLogin>(url, this.loginForm.value).subscribe({
      next: () => {
        this.navigate(this.jwtService.parseJwt(this.cookieService.get("auth-cookie")));

      },
      error: (error: any) => {
        this.warningMessage = GlobalConstants.genericError;
        this.alertType = 'danger';
        setTimeout(() => {
          this.confirmationMessage.close();
          this.warningMessage = '';
        }, 3000);

      }
    });
  }

  // function for navigating based on the role of the user
  navigate(user: any) {
    let navigationExtras: NavigationExtras = {};

    if (user.roles === 'ADMIN') {
      navigationExtras.queryParams = { role: 'admin' };
      this.router.navigateByUrl('admin', navigationExtras);
    } else if (user.roles === 'ORGANIZER') {
      navigationExtras.queryParams = { role: 'organizer' };
      this.router.navigateByUrl('event-list', navigationExtras);
    } else {
      navigationExtras.queryParams = { role: 'attendee' };
      this.router.navigateByUrl('event-list', navigationExtras);
    }
  }

  showPassword() {
    this.hide = !this.hide;
  }


}

