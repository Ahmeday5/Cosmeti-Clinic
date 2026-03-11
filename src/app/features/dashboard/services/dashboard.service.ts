import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Category, CategoryResponse } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiService = inject(ApiService);
  private readonly baseEndpoint = '/api/Dashboard/category';

  constructor() {}

  // ====================== GET ALL ======================
  getAll(): Observable<Category[]> {
    return this.apiService.get<Category[]>(this.baseEndpoint);
  }

  // ====================== GET BY ID ======================
  getById(id: number): Observable<Category> {
    return this.apiService.get<Category>(`${this.baseEndpoint}/${id}`);
  }

  // ====================== CREATE (FormData للصورة) ======================
  create(formData: FormData): Observable<CategoryResponse> {
    return this.apiService.post<CategoryResponse>(this.baseEndpoint, formData);
  }

  // ====================== UPDATE ======================
  update(id: number, formData: FormData): Observable<CategoryResponse> {
    return this.apiService.put<CategoryResponse>(
      `${this.baseEndpoint}/${id}`,
      formData,
    );
  }

  // ====================== DELETE ======================
  delete(id: number): Observable<CategoryResponse> {
    return this.apiService.delete<CategoryResponse>(
      `${this.baseEndpoint}/${id}`,
    );
  }
}
