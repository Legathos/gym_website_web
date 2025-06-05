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
import {LoggedInGuardService} from "@core/auth";
import {MemberGuardService} from "@domain/member";
import {ViewFoodItemComponent} from "./components/nutrition/view-food-item/view-food-item.component";

const routes: Routes = [
  {path: 'login', component: LoginComponent,canActivate:[LoggedInGuardService]},
  {path: 'profile/:id', component: ProfileComponent,canActivate:[MemberGuardService]},
  {path: 'landing-page', component:LandingPageComponent,canActivate:[LoggedInGuardService] },
  {path: 'workouts/:id', component: WorkoutsComponent,canActivate:[MemberGuardService]},
  {path: 'current-workout/:id', component: CurrentWorkoutComponent,canActivate:[MemberGuardService]},
  {path: 'exercises', component: ExercisesComponent,canActivate:[MemberGuardService]},
  {path: 'food', component: FoodComponent,canActivate:[MemberGuardService]},
  {path: 'view-food-item', component:ViewFoodItemComponent, canActivate:[MemberGuardService]},
  {path: 'food-tracker/:id', component: FoodTrackerComponent,canActivate:[MemberGuardService]},
  {path: 'register', component: RegisterComponent,canActivate:[LoggedInGuardService]},
  {path: '**', redirectTo: 'landing-page'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
