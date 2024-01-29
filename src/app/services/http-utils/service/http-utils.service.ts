import { Injectable } from '@angular/core';

@Injectable()
export class HttpUtilsService {
  private environment= "http://localhost:8080/";

  constructor() { }

  getFullUrl(url: string): string {
    return `${this.environment + url}`;
  }
}
