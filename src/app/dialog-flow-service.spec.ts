import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DialogflowService } from './dialog-flow-service';

describe('DialogflowService', () => {
  let service: DialogflowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(DialogflowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
