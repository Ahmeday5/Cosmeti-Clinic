import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import {
  NextSortOrderResponse,
  Product,
  ProductResponse,
} from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly api = inject(ApiService);
  // endpoint الاساسي
  private readonly endpoint = '/api/Dashboard/block';

  constructor() {}

  // ==========================
  // GET BY headcontent ID
  // ==========================

  getByHeadContentId(headContentId: number): Observable<Product[]> {
    return this.api.get<Product[]>(
      `/api/Dashboard/headcontent/${headContentId}/block`,
    );
  }

  // ==========================
  // GET BY ID
  // ==========================

  getById(id: number): Observable<Product> {
    return this.api.get<Product>(`${this.endpoint}/${id}`);
  }

  // جلب كل sub-blocks لبلوك معين
  getSubBlocks(parentBlockId: number): Observable<Product[]> {
    return this.api.get<Product[]>(
      `${this.endpoint}/${parentBlockId}/subblock`,
    );
  }

  // ==========================
  // CREATE
  // ==========================

  create(formData: FormData): Observable<ProductResponse> {
    return this.api.post<ProductResponse>(this.endpoint, formData);
  }

  // ==========================
  // UPDATE
  // ==========================

  update(id: number, formData: FormData): Observable<ProductResponse> {
    return this.api.put<ProductResponse>(`${this.endpoint}/${id}`, formData);
  }

  // ==========================
  // DELETE
  // ==========================

  delete(id: number): Observable<ProductResponse> {
    return this.api.delete<ProductResponse>(`${this.endpoint}/${id}`);
  }

  // ==========================
  // NEXT SORT ORDER
  // ==========================

  getNextSortOrder(headContentId: number): Observable<NextSortOrderResponse> {
    return this.api.get<NextSortOrderResponse>(
      `/api/Dashboard/blocks/next-sort-order?headContentId=${headContentId}`,
    );
  }
}
