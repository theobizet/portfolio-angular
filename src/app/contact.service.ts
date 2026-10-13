import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  /** Langue d'affichage du site (fr, en, de) : indique dans quelle langue répondre. */
  lang?: string;
  /** Champ piège anti-robots : toujours vide chez un humain. */
  honeypot?: string;
}

export interface ContactResponse {
  success: boolean;
  error?: string;
}

/**
 * Envoie le formulaire de contact au Worker Cloudflare, qui envoie le mail via Resend.
 * La clé API Resend vit côté Worker, jamais dans le bundle du site.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly workerUrl = environment.cloudflareWorkerUrl || '';

  send(payload: ContactPayload): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(`${this.workerUrl}/contact`, payload);
  }
}
