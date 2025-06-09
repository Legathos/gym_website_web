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
import {ViewLogItemComponent} from "./components/nutrition/view-log-item/view-log-item.component";
import {HomeComponent} from "./components/home/home.component";
import {FoodSearchComponent} from "./components/nutrition/food-search/food-search.component";
import {SettingsComponent} from "./components/settings/settings.component";
import {AiEstimatorComponent} from "./components/nutrition/ai-estimator/ai-estimator.component";
import {BarcodeScannerComponent} from "./components/nutrition/barcode-scanner/barcode-scanner.component";
import {AddFoodComponent} from "./components/nutrition/add-food/add-food.component";

const routes: Routes = [
  {path: 'login', component: LoginComponent,canActivate:[LoggedInGuardService]},
  {path: 'profile/:id', component: ProfileComponent,canActivate:[MemberGuardService]},
  {path: 'landing-page', component:LandingPageComponent,canActivate:[LoggedInGuardService] },
  {path: 'workouts/:id', component: WorkoutsComponent,canActivate:[MemberGuardService]},
  {path: 'current-workout/:id', component: CurrentWorkoutComponent,canActivate:[MemberGuardService]},
  {path: 'exercises', component: ExercisesComponent,canActivate:[MemberGuardService]},
  {path: 'food', component: FoodComponent,canActivate:[MemberGuardService]},
  {path: 'view-food-item', component:ViewFoodItemComponent, canActivate:[MemberGuardService]},
  {path: 'view-log-item', component:ViewLogItemComponent, canActivate:[MemberGuardService]},
  {path: 'food-tracker/:id', component: FoodTrackerComponent,canActivate:[MemberGuardService]},
  {path: 'register', component: RegisterComponent,canActivate:[LoggedInGuardService]},
  {path: 'home', component: HomeComponent,canActivate:[MemberGuardService]},
  {path: 'food-search', component: FoodSearchComponent,canActivate:[MemberGuardService] },
  {path: 'settings', component: SettingsComponent,canActivate:[MemberGuardService] },
  {path: 'ai-estimator', component: AiEstimatorComponent,canActivate:[MemberGuardService] },
  {path: 'barcode-scanner', component: BarcodeScannerComponent,canActivate:[MemberGuardService] },
  {path: 'add-food', component: AddFoodComponent,canActivate:[MemberGuardService] },
  {path: '**', redirectTo: 'landing-page'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
