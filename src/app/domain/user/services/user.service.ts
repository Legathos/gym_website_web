import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { EndpointDictionary } from '../../../../environments/endpoint-dictionary';
import { User } from '@domain/user';

export interface ResponseDto {
  status: string;
  message: string;
  data?: any;
}

@Injectable()
export class UserService {

  constructor( private httpClient: HttpClient) { }

  getUserByUsername(username:string):Observable<any>{
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const url = `${EndpointDictionary.getUserInfoByUsername}${username}?_=${timestamp}`;
    return this.httpClient.get<User>(url).pipe(
      map((response: any) => {
        console.log('API response for user data:', response);

        // Check if email field is missing and add a default value if needed
        if (!response.email) {
          console.warn('Email field is missing in the API response. Adding default email.');
          response.email = username + '@example.com'; // Default email based on username
        }

        return response;
      })
    );
  }

  getUserWeightHistory(id:number):Observable<any>{
    const url = EndpointDictionary.getUserWeightHistory+id;
    return this.httpClient.get(url)
  }

  editPassword(userDto: User): Observable<ResponseDto> {
    return this.httpClient.put<ResponseDto>(EndpointDictionary.changePassword, userDto);
  }

  editEmail(userDto: any): Observable<ResponseDto> {
    console.log('UserService.editEmail called with:', userDto);

    // Use the endpoint directly without appending the user ID
    const endpoint = EndpointDictionary.changeEmail;
    console.log('Using endpoint:', endpoint);

    // Send the entire userDto object in the request body
    console.log('Data to send in request body:', userDto);

    // Use PUT method with the entire userDto object
    return this.httpClient.put<ResponseDto>(endpoint, userDto);
  }

  editUser(userDto: User): Observable<ResponseDto> {
    console.log('UserService.editUser called with:', userDto);
    return this.httpClient.put<ResponseDto>(EndpointDictionary.editUser, userDto);
  }

  deleteUserById(id: number): Observable<any> {
    console.log('UserService.deleteUserById called with ID:', id);
    const url = `${EndpointDictionary.deleteUser}${id}`;
    console.log('Using endpoint:', url);
    return this.httpClient.delete(url);
  }
}
