import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Terms, TermsUpdateDto } from '../models/terms.model';

@Injectable({ providedIn: 'root' })
export class TermsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/Dashboard/terms-and-conditions';

  get(): Observable<Terms> {
    return this.api.get<Terms>(this.endpoint);
  }

  update(dto: TermsUpdateDto): Observable<void> {
    return this.api.put<void>(this.endpoint, dto);
  }
}
