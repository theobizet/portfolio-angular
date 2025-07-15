import { Component } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CardComponent,CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent {
  projects = [
    {
      year: '2024-2025',
      title: 'Création d’un logiciel basique de modification d’image pour le cours de traitement d’image',
      role: 'Développeur',
      imageUrl: '../../../assets/imgprocessorapp.jpg'
    },
    {
      year: '2024-2025',
      title: 'Création d’un logiciel démonstratif de la notion de graphe dans le cadre du cours sur les graphes',
      role: 'Chef de projet',
      imageUrl: '../../../assets/graph.jpg'
    },
    {
      year: '2024-2025',
      title: 'Création d\'un robot résolvant des labyrinthes',
      role: 'Chef de projet',
      imageUrl: '../../../assets/labyrinthe.jpg'
    },
    {
      year: '2023-2024',
      title: 'Mise en place du logiciel EFA cloud pour Mulhouse-Aviron',
      role: 'Informaticien',
      imageUrl: '../../../assets/aviron.jpg'
    },
    {
      year: '2023-2024',
      title: 'Présentation de MobileNet-SSD (Intelligence artificielle)',
      imageUrl: '../../../assets/mobilenetSSD.jpg'
    },
    {
      year: '2022-2023',
      title: 'Gestionnaire de rendez-vous avec C++ et QT',
      role: 'Développeur',
      imageUrl: '../../../assets/gestionRDV.png'
    },
    {
      year: '2021-2022',
      title: 'Base de données avec Microsoft Access : Gestion des vacataires de l\'UHA',
      role: 'Chef de projet',
      imageUrl: '../../../assets/BDDrelationnelle.jpeg'
    },
    {
      year: '2018-2019',
      title: 'Module pour motoriser un skateboard',
      role: 'Développeur',
      imageUrl: '../../../assets/skate.jpg'
    },
    {
      year: '2016-2017',
      title: 'Jeu vidéo « Pong » en Python',
      role: 'Développeur',
      imageUrl: '../../../assets/pong.png'
    }
  ];
}
