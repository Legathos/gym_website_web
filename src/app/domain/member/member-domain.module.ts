import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberGuardService, MemberService } from '@domain/member';

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
