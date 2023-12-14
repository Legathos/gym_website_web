import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpUtilsService } from './http-utils.service';


@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  url: string = 'http://localhost:8080/'
  constructor(private http: HttpClient, private httpUtilsService: HttpUtilsService) { }

}
