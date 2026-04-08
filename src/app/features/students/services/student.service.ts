import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ActivationResponse,
  Country,
  PaginatedResponse,
  Student,
  StudentFilterParams,
} from '../models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private readonly api = inject(ApiService);
  private readonly studentsEndpoint = '/api/Dashboard/students';
  private readonly countriesEndpoint = '/api/Dashboard/countries';

  // ==========================
  // GET STUDENTS (paginated + filters)
  // ==========================
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

  // ==========================
  // GET COUNTRIES
  // ==========================
  getCountries(): Observable<Country[]> {
    return this.api.get<Country[]>(this.countriesEndpoint);
  }

  // ==========================
  // TOGGLE ACTIVATION
  // ==========================
  toggleActivation(
    id: number,
    isActive: boolean,
  ): Observable<ActivationResponse> {
    return this.api.put<ActivationResponse>(
      `/api/Dashboard/student/${id}/activation?isActive=${isActive}`,
      {},
    );
  }
}
