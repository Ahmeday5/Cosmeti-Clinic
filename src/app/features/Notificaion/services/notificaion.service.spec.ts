import { TestBed } from '@angular/core/testing';

import { NotificaionService } from './notificaion.service';

describe('NotificaionService', () => {
  let service: NotificaionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificaionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
