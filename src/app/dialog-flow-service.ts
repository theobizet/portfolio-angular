import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DialogflowService {
  private http = inject(HttpClient);
  private dialogflowApiUrl = 'https://dialogflow.googleapis.com/v2/projects/';
  private sessionClientPath = '/agent/sessions/';

  // Méthode pour envoyer un message à Dialogflow ou à ton webhook Vercel
  sendMessage(message: string, sessionId: string = 'unique-session-id') {
    const projectId = environment.dialogflowProjectId;
    const url = `${this.dialogflowApiUrl}${projectId}${this.sessionClientPath}${sessionId}:detectIntent`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.dialogflowAccessToken}`,
      'Content-Type': 'application/json',
    });

    const body = {
      queryInput: {
        text: {
          text: message,
          languageCode: 'fr-FR',
        },
      },
    };

    return this.http.post(url, body, { headers }).pipe(
      catchError((error) => {
        console.error('Erreur Dialogflow :', error);
        return of({ queryResult: { fulfillmentText: "Désolé, je n'ai pas compris." } });
      })
    );
  }
}
