import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ActivationResponse,
  Country,
  PaginatedResponse,
  Student,
  StudentFilterParams,
  UpdateCategoryTypesDto,
} from '../models/student.model';
import { CategoryTypes } from '../../dashboard/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly api = inject(ApiService);
  private readonly studentsEndpoint = '/api/Dashboard/students';
  private readonly countriesEndpoint = '/api/Dashboard/countries';
  private readonly categoryTypesEndpoint = '/api/Auth/category-types';

  getStudents(
    params: StudentFilterParams,
  ): Observable<PaginatedResponse<Student>> {
    let endpoint = `${this.studentsEndpoint}?pageIndex=${params.pageIndex}&pageSize=${params.pageSize}`;

    if (params.search?.trim()) {
      endpoint += `&search=${encodeURIComponent(params.search.trim())}`;
    }

    if (params.countryId) {
      endpoint += `&countryId=${params.countryId}`;
    }

    return this.api.get<PaginatedResponse<Student>>(endpoint);
  }

  getCountries(): Observable<Country[]> {
    return this.api.get<Country[]>(this.countriesEndpoint);
  }

  getCategoryTypes(): Observable<CategoryTypes[]> {
    return this.api.get<CategoryTypes[]>(this.categoryTypesEndpoint);
  }

  toggleActivation(
    id: number,
    isActive: boolean,
  ): Observable<ActivationResponse> {
    return this.api.put<ActivationResponse>(
      `/api/Dashboard/student/${id}/activation?isActive=${isActive}`,
      {},
    );
  }

  updateCategoryTypes(
    id: number,
    dto: UpdateCategoryTypesDto,
  ): Observable<void> {
    return this.api.put<void>(
      `/api/Dashboard/student/${id}/category-types`,
      dto,
    );
  }

 delete(id: number): Observable<ActivationResponse> {
    return this.api.delete<ActivationResponse>(
      `/api/Dashboard/student/${id}`,
    );
  }
}
