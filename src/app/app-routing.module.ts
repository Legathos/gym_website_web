import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent} from "./components/auth/login/login.component";
import { LandingPageComponent} from "./components/landing-page/landing-page.component";
import { WorkoutsComponent} from "./components/training/workouts/workouts.component";
import { ExercisesComponent} from "./components/training/exercises/exercises.component";
import { FoodComponent} from "./components/nutrition/food/food.component";
import { FoodTrackerComponent} from "./components/nutrition/food-tracker/food-tracker.component";
import { CurrentWorkoutComponent} from "./components/training/current-workout/current-workout.component";
import { ProfileComponent} from "./components/profile/profile.component";
import { RegisterComponent} from "./components/auth/register/register.component";
import {LoggedInGuardService} from "./services/logged-in-guard.service";
import {RedirectGuardServiceService} from "./services/redirect-guard-service.service";


const routes: Routes = [
  {path: 'login', component: LoginComponent,canActivate:[LoggedInGuardService]},
  {path: 'profile/:id', component: ProfileComponent,canActivate:[RedirectGuardServiceService]},
  {path: 'landing-page', component:LandingPageComponent,canActivate:[RedirectGuardServiceService] },
  {path: 'workouts/:id', component: WorkoutsComponent,canActivate:[RedirectGuardServiceService]},
  {path: 'current-workout/:id', component: CurrentWorkoutComponent,canActivate:[RedirectGuardServiceService]},
  {path: 'exercises', component: ExercisesComponent,canActivate:[RedirectGuardServiceService]},
  {path: 'food', component: FoodComponent,canActivate:[RedirectGuardServiceService]},
  {path: 'food-tracker/:id', component: FoodTrackerComponent,canActivate:[RedirectGuardServiceService]},
  {path: 'register', component: RegisterComponent,canActivate:[]},
  {path: '**', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
