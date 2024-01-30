import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NgbAlert} from "@ng-bootstrap/ng-bootstrap";
import {NavigationExtras, Router} from "@angular/router";
import {CookieService} from "ngx-cookie-service";
import {JwtService} from "../../../core/auth/jwt-service.service";
import {GlobalConstants} from "../../../../data/global-constraints.data";
import { UserLogin, UserLoginService } from '@domain/user-login';
import {EndpointDictionary} from "../../../../environments/endpoint-dictionary";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  warningMessage !: string;
  alertType !: string;
  hide: boolean = true;
  @ViewChild('confirmationMessage', { static: false }) confirmationMessage!: NgbAlert;

  constructor(private router: Router,
              private userLoginService: UserLoginService,
              private cookieService: CookieService,
              private jwtService: JwtService) { }

  initLoginForm() {
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    })
  }

  ngOnInit(): void {
    this.initLoginForm();
  }

  onSubmit() {
    this.userLoginService.login<UserLogin>(EndpointDictionary.login, this.loginForm.value).subscribe({
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

  navigate(user: any) {
    let navigationExtras: NavigationExtras = {};
    if (user.roles === 'MEMBER') {
      navigationExtras.queryParams = { role: 'member' };
      this.router.navigateByUrl('landing-page', navigationExtras);
    }
  }

  showPassword() {
    this.hide = !this.hide;
  }
}
