import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogflowService } from '../../dialog-flow-service';

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

  sendMessage() {
    if (!this.userMessage.trim()) return; // Ignore les messages vides

    // Ajoute le message de l'utilisateur à la conversation
    this.messages.push({ text: this.userMessage, isUser: true });
    const currentMessage = this.userMessage; // Stocke le message avant de réinitialiser
    this.isLoading = true;
    this.userMessage = ''; // Réinitialise le champ de saisie

    // Appelle le service Dialogflow
    this.dialogflowService.sendMessage(currentMessage).subscribe({
      next: (response: any) => {
        const botReply = response.queryResult?.fulfillmentText || "Désolé, je n'ai pas compris.";
        this.messages.push({ text: botReply, isUser: false });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur Dialogflow :', error);
        const errorMessage = error.error?.message || "Désolé, une erreur est survenue.";
        this.messages.push({ text: errorMessage, isUser: false });
        this.isLoading = false;
      }
    });
  }
}
