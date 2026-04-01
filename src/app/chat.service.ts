import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { DialogflowService } from './dialog-flow-service';
import { LLMService } from './llm.service';
import { environment } from '../environments/environment';

/**
 * Service unifiée pour choisir entre Dialogflow et LLM (Cloudflare Workers AI)
 * Configure `useLLM` dans environment.ts pour basculer entre les deux
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private dialogflowService = inject(DialogflowService);
  private llmService = inject(LLMService);

  /**
   * Envoie un message en utilisant soit Dialogflow soit LLM
   * @param message Le texte à envoyer
   * @param sessionId (optionnel) ID de session pour Dialogflow
   */
  sendMessage(message: string, sessionId: string = '123456789'): Observable<any> {
    if (environment.useLLM) {
      // Utiliser LLM (Cloudflare Workers AI)
      console.log('📨 Envoi via LLM Cloudflare...');
      return this.llmService.askLLM(message).pipe(
        switchMap((response) => {
          // Formatter la réponse LLM pour la compatibilité avec le composant chat
          return of({
            queryResult: {
              fulfillmentText: response.response,
            },
            source: 'LLM'
          });
        }),
        catchError((error) => {
          console.error('❌ Erreur LLM:', error);
          return of({
            queryResult: {
              fulfillmentText: '❌ Désolé, le LLM est temporairement indisponible. Essayez à nouveau.',
            },
            error: true
          });
        })
      );
    } else {
      // Utiliser Dialogflow (par défaut)
      console.log('📨 Envoi via Dialogflow...');
      return this.dialogflowService.sendMessage(message, sessionId).pipe(
        catchError((error) => {
          console.error('❌ Erreur Dialogflow:', error);
          return of({
            queryResult: {
              fulfillmentText: '❌ Désolé, je n\'ai pas compris. Essayez à nouveau.',
            },
            error: true
          });
        })
      );
    }
  }

  /**
   * Teste la connexion au service actuellement configuré
   */
  testConnection(): Observable<any> {
    if (environment.useLLM) {
      return this.llmService.testConnection();
    } else {
      // Dialogflow n'a pas de health check exposé publiquement
      return of({ status: 'ok', service: 'dialogflow' });
    }
  }

  /**
   * Obtient le service actuellement actif
   */
  getActiveService(): string {
    return environment.useLLM ? 'LLM (Cloudflare Workers AI)' : 'Dialogflow';
  }
}
