import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() project: any;

  imageUrl(): string {
    return this.project.imageUrl || '/assets/default-image.jpg';
  }

  title(): string {
    return this.project.title || 'Titre du projet';
  }

  year(): string {
    return this.project.year || 'Année non spécifiée';
  }

  role(): string {
    return this.project.role || 'non spécifié';
  }
}
