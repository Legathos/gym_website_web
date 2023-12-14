import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {NgOptimizedImage} from "@angular/common";
import { LoginComponent } from './auth/login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { WorkoutsComponent } from './training/workouts/workouts.component';
import { ExercisesComponent } from './training/exercises/exercises.component';
import { CurrentWorkoutComponent } from './training/current-workout/current-workout.component';
import { FoodComponent } from './nutrition/food/food.component';
import { FoodTrackerComponent } from './nutrition/food-tracker/food-tracker.component';
import { RegisterComponent } from './auth/register/register.component';
import { NgChartsModule } from 'ng2-charts';


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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    NgOptimizedImage,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
