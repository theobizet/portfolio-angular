import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LLMService } from './llm.service';

describe('LLMService', () => {
  let service: LLMService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LLMService],
    });
    service = TestBed.inject(LLMService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should throw error if worker URL is not configured', () => {
    expect(() => service.askLLM('test prompt')).toThrowError('Worker URL non configurée');
  });

  it('should send POST request with prompt', () => {
    spyOnProperty(service as any, 'workerUrl', 'get').and.returnValue('https://test.workers.dev');

    service.askLLM('What is AI?').subscribe();

    const req = httpMock.expectOne('https://test.workers.dev');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ prompt: 'What is AI?', stream: false });
  });
});
