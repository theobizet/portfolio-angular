import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface Diploma {
  key: string;
  /** Absent : diplôme en cours. */
  done?: boolean;
}

interface Group {
  title: string;
  /** Préfixe des clés de traduction des compétences. */
  key: string;
  ids: string[];
  /** Étiquettes bleues (langages, outils) ou neutres (notions). */
  accent?: boolean;
}

interface Step {
  id: string;
  key: string;
  /** Année affichée dans la pastille ; sans année, une icône. */
  year?: string;
  current?: boolean;
  logo?: boolean;
  diplomas: Diploma[];
  groups: Group[];
}

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './education.component.html',
  styleUrl: './education.component.css'
})
export class EducationComponent {
  /** Étapes du parcours, de la plus ancienne à la plus récente. Les compétences sont traduites sous EDUCATION. */
  steps: Step[] = [
    {
      id: 'bac', key: 'EDUCATION.DON_BOSCO', year: '2019',
      diplomas: [{ key: 'EDUCATION.DON_BOSCO.BAC', done: true }],
      groups: [
        { title: 'TOOLS_TITLE', key: 'TOOLS', accent: true, ids: ['PYTHON', 'CAO', 'SOLIDWORKS', 'SKETCHUP', 'ARDUINO', 'OFFICE'] },
        { title: 'SKILLS_TITLE', key: 'SKILLS', ids: ['ELECTRONICS', 'MECHANICS', 'AUTOMATIC', 'ROBOTICS', 'TEAMWORK'] }
      ]
    },
    {
      id: 'uha', key: 'EDUCATION.UHA', year: '2025', current: true, logo: true,
      diplomas: [{ key: 'EDUCATION.UHA.MASTER' }, { key: 'EDUCATION.UHA.LICENCE', done: true }],
      groups: [
        { title: 'LANGUAGES_TITLE', key: 'LANGUAGES', accent: true,
          ids: ['C++', 'PHP', 'JAVA', 'JAVASCRIPT', 'SQL', 'LARAVEL', 'HTML_CSS', 'QT', 'VBA', 'PYTHON_AI', 'FLUTTER', 'BASH', 'POWERSHELL'] },
        { title: 'SKILLS_TITLE', key: 'SKILLS',
          ids: ['AI', 'PROJECT_MANAGEMENT', 'ACCOUNTING', 'ANALYTICAL_ACCOUNTING', 'NETWORK', 'UML', 'GIT', 'DATABASES', 'SOFTWARE_DEVELOPMENT'] }
      ]
    },
    {
      id: 'self', key: 'EDUCATION.SELF_TAUGHT',
      diplomas: [],
      groups: [{ title: 'SKILLS_TITLE', key: 'SKILLS', accent: true, ids: ['ANGULAR', 'TYPESCRIPT', 'REACT', 'KOTLIN'] }]
    }
  ];

  /** Formation en cours affichée par défaut. */
  selected = this.steps[1];
}
