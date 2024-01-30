import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class UserLoginService {

  constructor(private httpClient: HttpClient) { }

  login<UserLogin>(url: string, body: UserLogin): Observable<any> {
    return this.httpClient.post<UserLogin>(url, body, {
        "withCredentials": true
      }
    )
  }
}
