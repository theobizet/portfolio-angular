import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-credly-badge',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, TranslateModule],
  templateUrl: './credly-badge.component.html',
  styleUrls: ['./credly-badge.component.css']
})
export class CredlyBadgeComponent {
  /** Identifiant public du badge, visible dans l'URL credly.com/badges/<id>. */
  @Input({ required: true }) badgeId!: string;
  /** Nom de la certification. */
  @Input({ required: true }) name!: string;
  /** Organisme qui a délivré la certification. */
  @Input({ required: true }) issuer!: string;
  /** Image du badge, servie depuis /assets pour éviter un appel à un CDN tiers. */
  @Input({ required: true }) image!: string;
  /** Date d'obtention, affichée telle quelle (facultative). */
  @Input() issuedOn?: string;

  get badgeUrl(): string {
    return `https://www.credly.com/badges/${this.badgeId}`;
  }
}
