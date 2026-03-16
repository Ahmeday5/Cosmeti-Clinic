import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import {
  headcontent,
  headcontentResponse,
  NextSortOrderResponse,
} from '../models/sub-category.model';

@Injectable({
  providedIn: 'root',
})

export class SubCategoryService {
  private readonly api = inject(ApiService);

  // endpoint الاساسي
  private readonly endpoint = '/api/Dashboard/headcontent';

  constructor() {}

  // ==========================
  // GET ALL
  // ==========================

  getAll(): Observable<headcontent[]> {
    return this.api.get<headcontent[]>(this.endpoint);
  }

  // ==========================
  // GET BY SubCategory ID
  // ==========================

  getBySubCategoryId(headcontentId: number): Observable<headcontent[]> {
    return this.api.get<headcontent[]>(
      `/api/Dashboard/subcategory/${headcontentId}/headcontent`,
    );
  }

  // ==========================
  // GET BY ID
  // ==========================

  getById(id: number): Observable<headcontent> {
    return this.api.get<headcontent>(`${this.endpoint}/${id}`);
  }

  // ==========================
  // CREATE
  // ==========================

  create(formData: FormData): Observable<headcontentResponse> {
    return this.api.post<headcontentResponse>(this.endpoint, formData);
  }

  // ==========================
  // UPDATE
  // ==========================

  update(id: number, formData: FormData): Observable<headcontentResponse> {
    return this.api.put<headcontentResponse>(
      `${this.endpoint}/${id}`,
      formData,
    );
  }

  // ==========================
  // DELETE
  // ==========================

  delete(id: number): Observable<headcontentResponse> {
    return this.api.delete<headcontentResponse>(`${this.endpoint}/${id}`);
  }

  // ==========================
  // NEXT SORT ORDER
  // ==========================

  getNextSortOrder(subCategoryId: number): Observable<NextSortOrderResponse> {
    return this.api.get<NextSortOrderResponse>(
      `/api/Dashboard/headcontents/next-sort-order?subCategoryId=${subCategoryId}`,
    );
  }
}
