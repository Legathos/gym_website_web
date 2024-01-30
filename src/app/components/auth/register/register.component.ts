import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import { Router} from "@angular/router";
import {NgbAlert} from "@ng-bootstrap/ng-bootstrap";
import {MemberService} from "@domain/member";
import { User } from '@domain/user';
import {debounceTime} from "rxjs";

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

  onSubmit() {
    this.user = this.registerForm.value;
    this.memberService.registerUser(this.user).subscribe(() =>{
      this.router.navigateByUrl('login');
    });
    this.router.navigateByUrl('register')
  }

  showPassword() {
    this.hide = !this.hide;
  }


}
