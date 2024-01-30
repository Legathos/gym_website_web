import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberGuardService } from './service/member-guard.service';
import { MemberService } from './service/member.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    MemberGuardService,
    MemberService
  ]
})
export class MemberDomainModule { }
