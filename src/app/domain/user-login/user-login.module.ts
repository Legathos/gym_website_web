import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserLoginService } from '@domain/user-login/service/user-login.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    UserLoginService
  ]

})
export class UserLoginModule { }
