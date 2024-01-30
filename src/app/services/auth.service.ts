import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import { Observable, throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login<UserLogin>(url: string, body: UserLogin): Observable<any> {
    return this.http.post<UserLogin>(url, body, {
        "withCredentials": true
      }
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
