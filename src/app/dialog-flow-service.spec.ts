import { TestBed } from '@angular/core/testing';

import { DialogFlowService } from './dialog-flow-service';

describe('DialogFlowService', () => {
  let service: DialogFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogFlowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
