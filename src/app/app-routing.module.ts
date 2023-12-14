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


const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'profile/:id', component: ProfileComponent},
  {path: 'landing-page', component:LandingPageComponent },
  {path: 'workouts/:id', component: WorkoutsComponent},
  {path: 'current-workout/:id', component: CurrentWorkoutComponent},
  {path: 'exercises', component: ExercisesComponent},
  {path: 'food', component: FoodComponent},
  {path: 'food-tracker/:id', component: FoodTrackerComponent},
  {path: 'register', component: RegisterComponent},
  {path: '**', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
