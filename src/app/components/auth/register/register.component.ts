import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, NavigationExtras, Router} from "@angular/router";
import {NgbAlert} from "@ng-bootstrap/ng-bootstrap";
import {HttpClient} from "@angular/common/http";
import {RequestsService} from "../../../services/requests.service";
import {NotificationsService} from "angular2-notifications";
import {User} from "../../../../data/user.data";

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
  @ViewChild('confirmationMessage', {static: false}) confirmationMessage!: NgbAlert;

  constructor(private http: HttpClient, private requestsService: RequestsService,
              private route: ActivatedRoute,private router: Router) {
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
    console.log(this.registerForm)
  }


  showPassword() {
    this.hide = !this.hide;
  }

  register() {
    const postUrl: string = 'http://localhost:8080/user/register';
    const user: User = this.registerForm.value;
    return this.http.post(postUrl, user).subscribe({
      next: (data: any) => {
        console.log("User added successfully!")
        // this.successNotification("User added successfully!");
      },
    error: (error: any) =>  {
      console.log("Error")
      // this.errorNotification("There was an error while adding the user!");
    }
  })
  }
  navigate(user: any) {
    let navigationExtras: NavigationExtras = {};


      navigationExtras.queryParams = {role: 'member'};
      this.router.navigateByUrl('login', navigationExtras);
  }
}
