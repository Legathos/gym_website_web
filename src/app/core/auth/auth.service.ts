import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import { throwError} from "rxjs";


@Injectable()
export class AuthService {

  constructor(private http: HttpClient) { }


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
