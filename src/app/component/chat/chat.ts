import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp, faClock, faFileLines, faGlobe, faRobot, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { LLMService } from '../../llm.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, TranslateModule, FontAwesomeModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent {
  private readonly llmService = inject(LLMService);
  private readonly translate = inject(TranslateService);
  messages: { text: string; isUser: boolean }[] = [];
  userMessage: string = '';
  isLoading: boolean = false;
  suggestions = ['CONTACT.CHAT.Q1', 'CONTACT.CHAT.Q2', 'CONTACT.CHAT.Q3'];
  features = [
    { icon: faClock, key: 'CONTACT.CHAT.FEATURE_FAST' },
    { icon: faFileLines, key: 'CONTACT.CHAT.FEATURE_CV' },
    { icon: faGlobe, key: 'CONTACT.CHAT.FEATURE_LANGUAGE' }
  ];
  icons = { robot: faRobot, reset: faRotateLeft, send: faArrowUp };

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  /** Vide la conversation : le message d'accueil et les questions toutes prêtes réapparaissent. */
  reset() {
    this.messages = [];
    this.userMessage = '';
  }

  /** Envoie une question toute prête comme si l'utilisateur l'avait tapée. */
  ask(key: string) {
    this.userMessage = this.translate.instant(key);
    this.sendMessage();
  }

  sendMessage() {
    if (!this.userMessage.trim() || this.isLoading) return;

    const currentMessage = this.userMessage;
    this.messages.push({ text: currentMessage, isUser: true });
    this.isLoading = true;
    this.userMessage = '';
    setTimeout(() => this.scrollToBottom());

    this.llmService.askLLM(currentMessage, this.translate.getCurrentLang() || 'fr').subscribe({
      next: (response) => {
        this.addBotMessage(response?.response || this.translate.instant('CONTACT.CHAT.NOT_UNDERSTOOD'));
      },
      error: () => {
        this.addBotMessage(this.translate.instant('CONTACT.CHAT.ERROR'));
      }
    });
  }

  private addBotMessage(text: string) {
    this.messages.push({ text, isUser: false });
    this.isLoading = false;
    setTimeout(() => this.scrollToBottom());
  }

  private scrollToBottom(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
