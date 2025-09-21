import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogflowService } from '../../dialog-flow-service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent {
  private dialogflowService = inject(DialogflowService);
  messages: { text: string; isUser: boolean }[] = [];
  userMessage: string = '';
  isLoading: boolean = false;

  async sendMessage() {
    if (!this.userMessage.trim()) return;

    this.messages.push({ text: this.userMessage, isUser: true });
    this.isLoading = true;
    this.userMessage = '';

    try {
      const response: any = await lastValueFrom(this.dialogflowService.sendMessage(this.userMessage));
      const botReply = response.queryResult?.fulfillmentText || "Désolé, je n'ai pas compris.";
      this.messages.push({ text: botReply, isUser: false });
    } catch (error) {
      console.error('Erreur :', error);
      this.messages.push({ text: "Désolé, une erreur est survenue.", isUser: false });
    } finally {
      this.isLoading = false;
    }
  }
}
