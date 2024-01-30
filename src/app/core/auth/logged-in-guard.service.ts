import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { JwtServiceService } from './jwt-service.service';

@Injectable()
export class LoggedInGuardService implements CanActivate{

  constructor(private cookieService: CookieService, private router: Router, private jwtService: JwtServiceService) { }

  canActivate(): boolean{
    if(this.cookieService.get("auth-cookie")){
      const role = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).roles;
      if(role === 'MEMBER'){
        this.router.navigate(["landing-page"])
      }else
        this.router.navigate(["login"])
      return false;
    }
    return true;
  }
}
