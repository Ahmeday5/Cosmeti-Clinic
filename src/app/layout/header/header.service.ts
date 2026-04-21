import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';
import { visits } from './header.model';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private readonly apiService = inject(ApiService);
  private readonly baseEndpoint =
    '/api/Dashboard/analytics/mobile-visits/today';

  constructor() {}

  getVisits(): Observable<visits> {
    return this.apiService.get<visits>(`${this.baseEndpoint}`);
  }
}
