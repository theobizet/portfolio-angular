import { Component, inject, ViewChild, ElementRef, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp, faChevronDown, faCommentDots, faRobot, faRotateLeft, faXmark } from '@fortawesome/free-solid-svg-icons';
import { LLMService } from '../../llm.service';

/** Ouverture du widget, partagée avec la page Contact (bouton « Poser une question »). */
export const chatOpen = signal(false);

const HINT_KEY = 'chat-hint-dismissed';

/**
 * Assistant IA en bulle flottante, monté une seule fois dans app.component :
 * la conversation survit aux changements de page.
 */
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
  readonly open = chatOpen;
  /** Invitation « Une question sur mon parcours ? », masquée pour de bon dès qu'on l'a fermée ou qu'on a ouvert le chat. */
  readonly showHint = signal(!readHintDismissed());
  messages: { text: string; isUser: boolean }[] = [];
  userMessage: string = '';
  isLoading: boolean = false;
  suggestions = ['CONTACT.CHAT.Q1', 'CONTACT.CHAT.Q2', 'CONTACT.CHAT.Q3'];
  icons = { robot: faRobot, reset: faRotateLeft, send: faArrowUp, bubble: faCommentDots, close: faXmark, minimize: faChevronDown };

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLElement>;
  @ViewChild('chatInput') private chatInput?: ElementRef<HTMLInputElement>;
  @ViewChild('bubble') private bubble?: ElementRef<HTMLButtonElement>;

  constructor() {
    // Ouvert (par la bulle ou depuis la page Contact) : curseur dans le champ, derniers messages visibles.
    effect(() => {
      if (!this.open()) return;
      this.dismissHint();
      setTimeout(() => {
        this.scrollToBottom();
        this.chatInput?.nativeElement.focus();
      });
    });
  }

  toggle() {
    if (this.open()) this.close();
    else this.open.set(true);
  }

  /** Ferme le panneau et rend le focus à la bulle, pour ne pas perdre le clavier. */
  close() {
    this.open.set(false);
    setTimeout(() => this.bubble?.nativeElement.focus());
  }

  dismissHint() {
    this.showHint.set(false);
    try {
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      // Stockage indisponible (navigation privée, rendu serveur) : l'invitation reviendra, sans gravité.
    }
  }

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

function readHintDismissed(): boolean {
  try {
    return localStorage.getItem(HINT_KEY) === '1';
  } catch {
    return false;
  }
}
