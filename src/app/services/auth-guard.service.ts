import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private cookieService: CookieService, private router: Router) { }
  canActivate(): boolean {
    if(this.cookieService.get("auth-cookie")) {
      return true;
    }
    this.router.navigate(["login"]);
    return false;
  }
}
