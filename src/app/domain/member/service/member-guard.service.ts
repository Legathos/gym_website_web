import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { JwtService } from '@core/auth';

@Injectable()
export class MemberGuardService implements CanActivate{

  constructor(private cookieService: CookieService, private router: Router, private jwtService: JwtService) { }

  canActivate(): boolean {
    const role = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).roles;
    if(role === 'MEMBER') return true;
    this.router.navigate(["login"]);
    return false;
  }
}
