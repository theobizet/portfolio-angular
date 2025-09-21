import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class DialogflowService {
  private http = inject(HttpClient);

  async sendMessage(message: string) {
    // 1. Récupérer un token frais depuis ton backend
    const tokenResponse = await lastValueFrom(
      this.http.get<{ token: string }>('/get-dialogflow-token')
    );
    const token = tokenResponse.token;

    // 2. Appeler Dialogflow avec le token
    const projectId = environment.dialogflowProjectId;
    const url = `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/unique-session-id:detectIntent`;

    const response = await lastValueFrom(
      this.http.post(url, {
        queryInput: {
          text: {
            text: message,
            languageCode: 'fr-FR',
          },
        },
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    );

    return response;
  }
}
