import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, NavigationExtras, Router} from "@angular/router";
import {NgbAlert} from "@ng-bootstrap/ng-bootstrap";
import {HttpClient} from "@angular/common/http";
import {RequestsService} from "../../../services/requests.service";
import {NotificationsService} from "angular2-notifications";
import {User} from "../../../../data/user.data";
import {Observable, Subject} from "rxjs";
import {MemberService} from "../../../services/member.service";

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

  constructor(private http: HttpClient,
              private requestsService: RequestsService,
              private route: ActivatedRoute,
              private router: Router,
              private memberService: MemberService) {
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
    this.navigate(this.registerForm)
    this.register()
  }


  showPassword() {
    this.hide = !this.hide;
  }

  register() {
    this.user = this.registerForm.value;
    const url: string = 'http://localhost:8080/user/register';
    return this.http.post(url, this.user).subscribe({
      next: () => {
        },
      error: (error) => {
        console.log(error)
        }
    });
  }
  navigate(user: any) {
    let navigationExtras: NavigationExtras = {};


    navigationExtras.queryParams = {role: 'member'};
    this.router.navigateByUrl('login', navigationExtras);
  }
}
