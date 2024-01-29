import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberDomainModule } from '../services/member';
import { UserModule } from '../services/user/user.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MemberDomainModule,
    UserModule
  ]
})
export class CoreModule { }
