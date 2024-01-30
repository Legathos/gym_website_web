import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberDomainModule } from '../services/member';
import { UserModule } from '../services/user';
import { UserLoginModule } from '../services/user-login';
import { FoodDomainModule } from '../services/food';
import { LocalStorageDomainModule } from '../services/local-storage/local-storage-domain.module';
import { AuthDomainModule } from './auth/auth-domain.module';

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
