import { Component } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CardComponent, CommonModule, TranslateModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent {
  projects = [
    {
      year: '2024-2025',
      titleKey: 'PROJECTS.IMAGE_PROCESSOR_TITLE',
      roleKey: 'PROJECTS.ROLES.DEVELOPER',
      imageUrl: './assets/imgprocessorapp.jpg'
    },
    {
      year: '2024-2025',
      titleKey: 'PROJECTS.GRAPH_SOFTWARE_TITLE',
      roleKey: 'PROJECTS.ROLES.PROJECT_LEAD',
      imageUrl: './assets/graph.jpg'
    },
    {
      year: '2024-2025',
      titleKey: 'PROJECTS.MAZE_ROBOT_TITLE',
      roleKey: 'PROJECTS.ROLES.PROJECT_LEAD',
      imageUrl: './assets/labyrinthe.jpg'
    },
    {
      year: '2023-2024',
      titleKey: 'PROJECTS.EFA_CLOUD_TITLE',
      roleKey: 'PROJECTS.ROLES.IT_SPECIALIST',
      imageUrl: './assets/aviron.jpg'
    },
    {
      year: '2023-2024',
      titleKey: 'PROJECTS.MOBILENET_PRESENTATION_TITLE',
      imageUrl: './assets/mobilenetSSD.jpg'
    },
    {
      year: '2022-2023',
      titleKey: 'PROJECTS.APPOINTMENT_MANAGER_TITLE',
      roleKey: 'PROJECTS.ROLES.DEVELOPER',
      imageUrl: './assets/gestionRDV.png'
    },
    {
      year: '2021-2022',
      titleKey: 'PROJECTS.VACATION_DATABASE_TITLE',
      roleKey: 'PROJECTS.ROLES.PROJECT_LEAD',
      imageUrl: './assets/BDDrelationnelle.jpeg'
    },
    {
      year: '2018-2019',
      titleKey: 'PROJECTS.SKATEBOARD_MODULE_TITLE',
      roleKey: 'PROJECTS.ROLES.DEVELOPER',
      imageUrl: './assets/skate.jpg'
    },
    {
      year: '2016-2017',
      titleKey: 'PROJECTS.PYTHON_PONG_TITLE',
      roleKey: 'PROJECTS.ROLES.DEVELOPER',
      imageUrl: './assets/pong.png'
    }
  ];
}
