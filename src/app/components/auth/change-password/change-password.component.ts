import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "../../../../data/user.data";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../services/auth.service";
import {JwtServiceService} from "../../../services/jwt-service.service";
import {HttpClient} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";
import {NotificationsService} from "angular2-notifications";
import {ChangePasswordData} from "../../../../data/changepassworddata.data";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {

  changePasswordForm!: FormGroup;
  user!: User;
  username!: string | null;

  constructor(private router: Router, private authService: AuthService, private route: ActivatedRoute,
              private jwtService: JwtServiceService, private cookieService: CookieService, private notificationService: NotificationsService,
              private http: HttpClient) { }

  onCancel() {
    this.router.navigateByUrl('login');
  }

  initChangePassForm() {
    this.changePasswordForm = new FormGroup({
      oldPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', Validators.required),
      newPasswordConfirmation: new FormControl('', Validators.required)
    })
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.username = params['username'];
    });
    this.initChangePassForm();
  }

  onSubmit() {
    const url = 'http://localhost:8080/user/change-password';
    const changePasswordData: ChangePasswordData = {
      username: this.username,
      oldPassword: this.changePasswordForm.value.oldPassword,
      newPassword: this.changePasswordForm.value.newPassword,
      newPasswordConfirmation: this.changePasswordForm.value.newPasswordConfirmation
    }

    this.authService.changePassword<ChangePasswordData>(url, changePasswordData).subscribe({
      next: (data: ChangePasswordData) => {
        setTimeout(() => this.router.navigateByUrl('login'), 3000);
        this.successNotification("Password changed successfully!");
      },
      error: (error: any) => {
        this.errorNotification("There was an error while changing the password!");
      }
    })
  }

  successNotification(message: string) {
    {
      this.notificationService.success(
        'Success',
        message,
        {
          position: ['bottom', 'right'],
          timeOut: 3000,
          animate: 'fade',
          showProgressBar: true
        }
      );
    }
  }
  errorNotification(message: string) {
    this.notificationService.error(
      'Error',
      message,
      {
        position: ['bottom', 'right'],
        timeOut: 3000,
        animate: 'fade',
        showProgressBar: true
      }
    );
  }
}

