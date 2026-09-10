import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  /** Champ piège anti-robots : toujours vide chez un humain. */
  honeypot?: string;
}

export interface ContactResponse {
  success: boolean;
  error?: string;
}

/**
 * Envoie le formulaire de contact au Worker Cloudflare, qui relaie vers Static Forms.
 * La clé API du service de formulaire vit côté Worker, jamais dans le bundle du site.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private workerUrl = environment.cloudflareWorkerUrl || '';

  send(payload: ContactPayload): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(`${this.workerUrl}/contact`, payload);
  }
}
