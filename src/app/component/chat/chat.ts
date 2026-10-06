import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp, faClock, faFileLines, faGlobe, faRobot, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { ChatService } from '../../chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, TranslateModule, FontAwesomeModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent {
  private chatService = inject(ChatService);
  private translate = inject(TranslateService);
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

    this.chatService.sendMessage(currentMessage, this.translate.getCurrentLang() || 'fr').subscribe({
      next: (response: any) => {
        // Le service renvoie error: true au lieu de lever une erreur : on affiche le message traduit.
        const botReply = response.error
          ? this.translate.instant('CONTACT.CHAT.ERROR')
          : response.queryResult?.fulfillmentText || this.translate.instant('CONTACT.CHAT.NOT_UNDERSTOOD');
        this.addBotMessage(botReply);
      },
      error: (error) => {
        console.error('Erreur Chat:', error);
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
