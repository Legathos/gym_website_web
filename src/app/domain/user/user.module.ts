import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@domain/user/services/user.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],

  providers: [
    UserService
  ]
})
export class UserModule { }
