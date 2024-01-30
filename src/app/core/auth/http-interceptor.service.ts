import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { EMPTY, Observable } from 'rxjs';

import { JwtService } from '@core/auth';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  constructor(private cookieService: CookieService, private jwtService: JwtService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.includes("login")) {
      const jwt = this.cookieService.get("auth-cookie");
      if (jwt !== '' && Date.now() > this.jwtService.parseJwt(jwt).exp * 1000) {
        //TO DO: Afiseaza modal sau o pagina noua si dupa redirect
        return EMPTY;
      }
      const header = {
        "app-auth": jwt
      }
      req = req.clone({
        setHeaders: header
      })
    }
    return next.handle(req);
  }


}
