import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import { Router} from "@angular/router";
import {NgbAlert} from "@ng-bootstrap/ng-bootstrap";
import {MemberService} from "@domain/member";
import { User } from '@domain/user';

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
  userRegisteredCheck!: boolean;
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
      role: new FormControl('member'),
      age: new FormControl('', Validators.required),
      weight: new FormControl('', Validators.required),
      height: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
    })

  }

  onSubmit(event?: Event) {
    console.log('onSubmit called');
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
        this.warningMessage = 'Registration failed: ' + (error.message || 'Unknown error');
      }
    });
  }

  showPassword() {
    this.hide = !this.hide;
  }


}
