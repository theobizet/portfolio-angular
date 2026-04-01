import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class LLMService {
  private http = inject(HttpClient);
  private workerUrl = environment.cloudflareWorkerUrl || '';

  /**
   * Envoie un message au LLM via Cloudflare Workers AI
   * @param prompt Le texte à envoyer au modèle
   * @returns Observable avec la réponse du LLM
   */
  askLLM(prompt: string): Observable<any> {
    if (!this.workerUrl) {
      throw new Error('Worker URL non configurée. Vérifiez environment.ts');
    }

    return this.http.post(this.workerUrl, {
      prompt: prompt,
      stream: false // Set à true si tu veux du streaming
    });
  }

  /**
   * Teste la connexion au Worker
   */
  testConnection(): Observable<any> {
    return this.http.get(`${this.workerUrl}/health`);
  }
}
