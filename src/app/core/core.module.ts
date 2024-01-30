import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberDomainModule } from '@domain/member';
import { UserModule } from '@domain/user';
import { UserLoginModule } from '@domain/user-login';
import { FoodDomainModule } from '@domain/food';
import { LocalStorageDomainModule } from '@domain/local-storage';
import { AuthDomainModule } from '@core/auth/auth-domain.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MemberDomainModule,
    UserModule,
    UserLoginModule,
    FoodDomainModule,
    LocalStorageDomainModule,
    AuthDomainModule
  ]
})
export class CoreModule { }
