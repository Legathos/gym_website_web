import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent} from "./login/login.component";
import { LandingPageComponent} from "./landing-page/landing-page.component";
import { WorkoutsComponent} from "./workouts/workouts.component";
import { ExercisesComponent} from "./exercises/exercises.component";
import { FoodComponent} from "./food/food.component";
import { FoodTrackerComponent} from "./food-tracker/food-tracker.component";
import { CurrentWorkoutComponent} from "./current-workout/current-workout.component";
import { ProfileComponent} from "./profile/profile.component";
import { RegisterComponent} from "./register/register.component";
import * as path from "path";

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'landing-page', component:LandingPageComponent },
  {path: 'workouts', component: WorkoutsComponent},
  {path: 'current-workout', component: CurrentWorkoutComponent},
  {path: 'exercises', component: ExercisesComponent},
  {path: 'food', component: FoodComponent},
  {path: 'food-tracker', component: FoodTrackerComponent},
  {path: 'register', component: RegisterComponent},
  {path: '**', redirectTo: 'landing-page'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
