import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { JwtServiceService } from './jwt-service.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectGuardServiceService implements CanActivate{

  constructor(private cookieService: CookieService, private router: Router, private jwtService: JwtServiceService) { }

  canActivate(): boolean{
    if(!this.cookieService.get("auth-cookie")){
      this.router.navigate(["login"]);
      return false;
    }
    return true;
  }
}
