import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import {
  NextSortOrderResponse,
  SubCategory,
  SubCategoryResponse,
} from '../models/main-category.model';

@Injectable({
  providedIn: 'root',
})
export class MainCategoryService {
  private readonly api = inject(ApiService);

  // endpoint الاساسي
  private readonly endpoint = '/api/Dashboard/subcategory';

  constructor() {}

  // ==========================
  // GET ALL
  // ==========================

  getAll(): Observable<SubCategory[]> {
    return this.api.get<SubCategory[]>(this.endpoint);
  }

  // ==========================
  // GET BY CATEGORY ID
  // ==========================

  getByCategoryId(categoryId: number): Observable<SubCategory[]> {
    return this.api.get<SubCategory[]>(
      `/api/Dashboard/category/${categoryId}/subcategory`,
    );
  }

  // ==========================
  // GET BY ID
  // ==========================

  getById(id: number): Observable<SubCategory> {
    return this.api.get<SubCategory>(`${this.endpoint}/${id}`);
  }

  // ==========================
  // CREATE
  // ==========================

  create(formData: FormData): Observable<SubCategoryResponse> {
    return this.api.post<SubCategoryResponse>(this.endpoint, formData);
  }

  // ==========================
  // UPDATE
  // ==========================

  update(id: number, formData: FormData): Observable<SubCategoryResponse> {
    return this.api.put<SubCategoryResponse>(
      `${this.endpoint}/${id}`,
      formData,
    );
  }

  // ==========================
  // DELETE
  // ==========================

  delete(id: number): Observable<SubCategoryResponse> {
    return this.api.delete<SubCategoryResponse>(`${this.endpoint}/${id}`);
  }

  // ==========================
  // NEXT SORT ORDER
  // ==========================

  getNextSortOrder(categoryId: number): Observable<NextSortOrderResponse> {
    return this.api.get<NextSortOrderResponse>(
      `/api/Dashboard/subcategories/next-sort-order?categoryId=${categoryId}`,
    );
  }
}
