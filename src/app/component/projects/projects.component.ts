import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';

type Context = 'UNIVERSITY' | 'ASSOCIATION' | 'HIGH_SCHOOL';

interface Project {
  /** Clé sous PROJECTS.ITEMS (titre et sous-titre). */
  id: string;
  year: string;
  context: Context;
  /** Clé sous PROJECTS.ROLES. */
  role?: string;
  /** Clés sous PROJECTS.TECH. */
  tech: string[];
  image: string;
  code?: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [TranslateModule, FontAwesomeModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent {
  readonly icons = { code: faCode };

  /** Projets du plus récent au plus ancien. */
  projects: Project[] = [
    { id: 'IMAGE_PROCESSOR', year: '2024 – 2025', context: 'UNIVERSITY', role: 'DEVELOPER', tech: ['PYTHON', 'OPENCV', 'TKINTER'],
      image: 'assets/imgprocessorapp.jpg', code: 'https://github.com/theobizet/image_processing_app' },
    { id: 'GRAPH_SOFTWARE', year: '2024 – 2025', context: 'UNIVERSITY', role: 'PROJECT_LEAD', tech: ['CPP'],
      image: 'assets/graph.jpg', code: 'https://github.com/theobizet/projet_graphe_algo' },
    { id: 'MAZE_ROBOT', year: '2024 – 2025', context: 'UNIVERSITY', role: 'PROJECT_LEAD', tech: ['CPP', 'ALGORITHMS'],
      image: 'assets/labyrinthe.jpg', code: 'https://github.com/theobizet/Projet_Qualite_de_prog' },
    { id: 'EFA_CLOUD', year: '2023 – 2024', context: 'ASSOCIATION', role: 'IT_SPECIALIST', tech: ['DEPLOYMENT', 'PHP'], image: 'assets/aviron.jpg' },
    { id: 'MOBILENET', year: '2023 – 2024', context: 'UNIVERSITY', tech: ['AI', 'OBJECT_DETECTION'], image: 'assets/mobilenetSSD.jpg' },
    { id: 'APPOINTMENT_MANAGER', year: '2022 – 2023', context: 'UNIVERSITY', role: 'DEVELOPER', tech: ['CPP', 'QT'], image: 'assets/gestionRDV.png' },
    { id: 'VACATION_DATABASE', year: '2021 – 2022', context: 'UNIVERSITY', role: 'PROJECT_LEAD', tech: ['ACCESS'], image: 'assets/BDDrelationnelle.jpeg' },
    { id: 'SKATEBOARD', year: '2018 – 2019', context: 'HIGH_SCHOOL', role: 'DEVELOPER', tech: ['SOLIDWORKS', 'ARDUINO'], image: 'assets/skate.jpg' },
    { id: 'PONG', year: '2016 – 2017', context: 'HIGH_SCHOOL', role: 'DEVELOPER', tech: ['PYTHON'], image: 'assets/pong.png' }
  ];

  /** Filtres avec le nombre de projets de chaque contexte ; null = tous. */
  filters = [null, 'UNIVERSITY', 'ASSOCIATION', 'HIGH_SCHOOL'].map(context => ({
    context: context as Context | null,
    count: this.projects.filter(p => !context || p.context === context).length
  }));

  selected: Context | null = null;

  get shown(): Project[] {
    return this.projects.filter(p => !this.selected || p.context === this.selected);
  }
}
