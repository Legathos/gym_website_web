import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import {NgbActiveModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {DatePipe, NgOptimizedImage} from "@angular/common";
import { LoginComponent } from './components/auth/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { WorkoutsComponent } from './components/training/workouts/workouts.component';
import { ExercisesComponent } from './components/training/exercises/exercises.component';
import { CurrentWorkoutComponent } from './components/training/current-workout/current-workout.component';
import { FoodComponent } from './components/nutrition/food/food.component';
import { FoodTrackerComponent } from './components/nutrition/food-tracker/food-tracker.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { NgChartsModule } from 'ng2-charts';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { ChangePasswordComponent } from './components/auth/change-password/change-password.component';
import {NavBarComponent} from "./components/nav-bar/nav-bar.component";
import {SimpleNotificationsModule} from "angular2-notifications";
import { HttpInterceptorService } from './services/http-interceptor.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import { DialogComponent } from './components/dialog/dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatDialogActions, MatDialogClose, MatDialogContent} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {MemberGuardService} from "./services/member-guard.service";


@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    NavBarComponent,
    LoginComponent,
    ProfileComponent,
    WorkoutsComponent,
    ExercisesComponent,
    CurrentWorkoutComponent,
    FoodComponent,
    FoodTrackerComponent,
    RegisterComponent,
    ChangePasswordComponent,
    NavBarComponent,
    DialogComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgbModule,
        NgOptimizedImage,
        NgChartsModule,
        ReactiveFormsModule,
        SimpleNotificationsModule,
        HttpClientModule,
        FormsModule,
        BrowserAnimationsModule,
        MatDialogContent,
        MatDialogActions,
        MatButtonModule,
        MatDialogClose,
    ],
  providers: [NgbActiveModal,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    MemberGuardService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
