import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JwtService, HttpInterceptorService, AuthService, LoggedInGuardService } from '@core/auth';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    AuthService,
    HttpInterceptorService,
    JwtService,
    LoggedInGuardService
  ]
})
export class AuthDomainModule { }
