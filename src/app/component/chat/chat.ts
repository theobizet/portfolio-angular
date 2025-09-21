import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DialogflowService } from '../../dialog-flow-service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent {
  private dialogflowService = inject(DialogflowService);
  messages: { text: string; isUser: boolean; timestamp: Date }[] = [];
  userMessage: string = '';
  isLoading: boolean = false;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

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

    this.dialogflowService.sendMessage(currentMessage).subscribe({
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
        console.error('Erreur Dialogflow :', error);
        this.messages.push({
          text: "Désolé, une erreur est survenue.",
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
