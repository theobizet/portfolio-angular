import { Component, inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChatService } from '../../chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit {
  private chatService = inject(ChatService);
  messages: { text: string; isUser: boolean; timestamp: Date }[] = [];
  userMessage: string = '';
  isLoading: boolean = false;
  activeService: string = '';

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  ngOnInit() {
    this.activeService = this.chatService.getActiveService();
    console.log('🤖 Service actif:', this.activeService);
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    // Ajoute le message utilisateur
    this.messages.push({
      text: this.userMessage,
      isUser: true,
      timestamp: new Date()
    });
    const currentMessage = this.userMessage;
    this.isLoading = true;
    this.userMessage = '';

    // Défile automatiquement vers le bas
    setTimeout(() => this.scrollToBottom());

    this.chatService.sendMessage(currentMessage).subscribe({
      next: (response: any) => {
        const botReply = response.queryResult?.fulfillmentText || "Désolé, je n'ai pas compris.";
        this.messages.push({
          text: botReply,
          isUser: false,
          timestamp: new Date()
        });
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Erreur Chat:', error);
        this.messages.push({
          text: "❌ Désolé, une erreur est survenue. Vérifiez que le service est configuré correctement.",
          isUser: false,
          timestamp: new Date()
        });
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) {
      console.error('Erreur de scroll:', err);
    }
  }
}
