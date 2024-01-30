import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { HttpInterceptorService } from './http-interceptor.service';
import { JwtServiceService } from './jwt-service.service';
import { LoggedInGuardService } from './logged-in-guard.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    AuthService,
    HttpInterceptorService,
    JwtServiceService,
    LoggedInGuardService
  ]
})
export class AuthDomainModule { }
