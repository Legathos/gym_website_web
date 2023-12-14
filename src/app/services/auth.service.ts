import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {CookieService} from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  login<UserLogin>(url: string, body: UserLogin): Observable<any> {
    return this.http.post<UserLogin>(url, body, {
        "withCredentials": true
      }
    )
  }

  changePassword<ChangePasswordData>(url: string, body: ChangePasswordData) : Observable<ChangePasswordData>{
    return this.http.put<ChangePasswordData>(url, body).pipe(
      catchError(this.handleError)
    )
  }

  public handleError(error: HttpErrorResponse) {
    let errorMsg = '';
    if (error?.error instanceof ErrorEvent) {
      errorMsg = `Error: ${error.error.message}`;
    } else {
      errorMsg = error.message;
    }
    return throwError(() => new Error(errorMsg));
  }

}
