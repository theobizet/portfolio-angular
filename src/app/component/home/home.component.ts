import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { ThemeService } from '../../theme.service';
import { RouterLink } from '@angular/router';
import { NgbCarouselConfig, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink,NgbCarouselModule,CommonModule],
  providers: [NgbCarouselConfig],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent {
  isDarkTheme: boolean | undefined;
  tabs = [
    {
      title: 'À propos de moi',
      description: 'Présentation et parcours personnel',
      route: '/about',
      imageUrl : './assets/about.jpg'
    },
    {
      title: 'Éducation',
      description: 'Formation académique et compétences acquises',
      route: '/education',
      imageUrl : './assets/education.jpg'
    },
    {
      title: 'Projets',
      description: 'Projets réalisés et technologies utilisées',
      route: '/projects',
      imageUrl : './assets/projects.jpg'
    },
    {
      title: 'Expérience',
      description: 'Expériences professionnelles et stages',
      route: '/experience',
      imageUrl : './assets/experience.jpg'
    },
    {
      title: 'Contact',
      description: 'Informations de contact et réseaux sociaux',
      route: '/contact',
      imageUrl : './assets/contact.jpg'
    }
  ];
  constructor(public themeService: ThemeService, config: NgbCarouselConfig) {
    this.themeService.darkMode$.subscribe(darkMode => {
      this.isDarkTheme = darkMode;
    });
  }
}
