import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import {
  AppUser,
  AppUserDetail,
  AppUserRequest,
  AppUserResponse,
} from '../models/app-user.model';

@Injectable({
  providedIn: 'root',
})
export class AppUserService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/Dashboard/appuser';
  
  // ==========================
  // GET ALL
  // ==========================
  getAll(): Observable<AppUser[]> {
    return this.api.get<AppUser[]>(this.endpoint);
  }

  // ==========================
  // GET BY ID
  // ==========================
  getById(id: string): Observable<AppUserDetail> {
    return this.api.get<AppUserDetail>(`${this.endpoint}/${id}`);
  }

  // ==========================
  // CREATE
  // ==========================
  create(body: AppUserRequest): Observable<AppUserResponse> {
    return this.api.post<AppUserResponse>(this.endpoint, body);
  }

  // ==========================
  // UPDATE
  // ==========================
  update(id: string, body: AppUserRequest): Observable<AppUserResponse> {
    return this.api.put<AppUserResponse>(`${this.endpoint}/${id}`, body);
  }

  // ==========================
  // DELETE
  // ==========================
  delete(id: string): Observable<AppUserResponse> {
    return this.api.delete<AppUserResponse>(`${this.endpoint}/${id}`);
  }
}
