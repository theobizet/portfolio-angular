import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChatService } from './chat.service';
import { DialogflowService } from './dialog-flow-service';
import { LLMService } from './llm.service';

describe('ChatService', () => {
  let service: ChatService;
  let dialogflowService: DialogflowService;
  let llmService: LLMService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChatService, DialogflowService, LLMService],
    });
    service = TestBed.inject(ChatService);
    dialogflowService = TestBed.inject(DialogflowService);
    llmService = TestBed.inject(LLMService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should have getActiveService method', () => {
    expect(typeof service.getActiveService).toBe('function');
  });

  it('should have sendMessage method', () => {
    expect(typeof service.sendMessage).toBe('function');
  });

  it('should have testConnection method', () => {
    expect(typeof service.testConnection).toBe('function');
  });
});
