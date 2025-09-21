import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class DialogflowService {
  private http = inject(HttpClient);

  sendMessage(message: string, sessionId: string = '123456789'): Observable<any> {
    // 1. Récupérer le token
    return this.http.get<{ token: string }>('/get-dialogflow-token').pipe(
      switchMap((tokenResponse) => {
        const token = tokenResponse.token;
        const projectId = environment.dialogflowProjectId;
        const url = `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${sessionId}:detectIntent`;

        // 2. Appeler Dialogflow avec le token
        return this.http.post(url, {
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
        });
      })
    );
  }
}
