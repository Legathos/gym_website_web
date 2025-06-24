import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import { Router} from "@angular/router";
import {NgbAlert} from "@ng-bootstrap/ng-bootstrap";
import {MemberService} from "@domain/member";
import { User } from '@domain/user';
import {GlobalConstants} from "../../../../data/global-constraints.data";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm: any;
  hide: boolean = true;
  warningMessage!: string;
  alertType!: string;
  user!: User;
  @ViewChild('confirmationMessage', {static: false}) confirmationMessage!: NgbAlert;

  constructor(private router: Router,
              private memberService:MemberService) {
  }

  ngOnInit(): void {
    this.initRegisterForm()
  }

  initRegisterForm() {
    this.registerForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      role: new FormControl('member'),
      age: new FormControl('', Validators.required),
      weight: new FormControl('', Validators.required),
      height: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
    })

  }

  onSubmit(event?: Event) {
    if (event) {
      event.preventDefault(); // Prevent default form submission
    }

    if (this.registerForm.invalid) {
      this.alertType = 'danger';
      this.warningMessage = 'Please fill in all required fields';
      return;
    }

    this.user = this.registerForm.value;
    this.memberService.registerUser(this.user).subscribe({
      next: () => {
        this.alertType = 'success';
        this.warningMessage = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigateByUrl('login');
        }, 1500);
      },
      error: (error) => {
        this.alertType = 'danger';

        // Display specific error messages based on the error status
        if (error.status === 409) {
          this.warningMessage = GlobalConstants.userExistError;
        } else if (error.status === 400) {
          this.warningMessage = GlobalConstants.invalidRegistrationData;
        } else if (error.status === 422) {
          this.warningMessage = GlobalConstants.usernameEmailInUse;
        } else if (error.status === 0) {
          this.warningMessage = GlobalConstants.networkError;
        } else {
          // Fallback to a more descriptive error message
          this.warningMessage = 'Registration failed: ' + (error.error?.message || error.message || 'Unknown error');
        }
      }
    });
  }

  showPassword() {
    this.hide = !this.hide;
  }


}
