import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FoodService } from '@domain/food';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    FoodService
  ]
})
export class FoodDomainModule { }
