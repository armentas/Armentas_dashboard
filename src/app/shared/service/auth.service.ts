import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl: string = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }


  register(data): Promise<any> {
    return lastValueFrom(this.httpClient.post<any>(`${this.baseUrl}/auth/register`, data));
  }

  login(data): Promise<any> {
    return lastValueFrom(this.httpClient.post<any>(`${this.baseUrl}/auth/login`, data));
  }

  getUser(id): Promise<any> {
    return lastValueFrom(this.httpClient.get<any>(`${this.baseUrl}/auth/getUser/${id}`));
  }

  getUsers(): Promise<any> {
    return lastValueFrom(this.httpClient.get<any>(`${this.baseUrl}/auth/getUsers`));
  }

  updateUser(id, data): Promise<any> {
    return lastValueFrom(this.httpClient.put<any>(`${this.baseUrl}/auth/updateUser/${id}`, data));
  }

  deleteUser(id): Promise<any> {
    return lastValueFrom(this.httpClient.delete<any>(`${this.baseUrl}/auth/deleteUser/${id}`));
  }
}
