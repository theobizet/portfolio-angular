import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslateModule, FontAwesomeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  icons = { arrow: faArrowRight, location: faLocationDot, linkedin: faLinkedinIn, github: faGithub };

  // Badges shields.io : [libellé, couleur, logo simple-icons, couleur du logo]
  stack = [
    { labelKey: 'HOME.STACK.SOFTWARE', badges: [['C++', '00599C', 'cplusplus'], ['Java', 'ED8B00', 'openjdk']] },
    { labelKey: 'HOME.STACK.WEB', badges: [['JavaScript', 'F7DF1E', 'javascript', 'black'], ['PHP', '777BB4', 'php'], ['HTML5', 'E34F26', 'html5'], ['CSS', '663399', 'css']] },
    { labelKey: 'HOME.STACK.DATA', badges: [['SQL', '4479A1', '']] },
    { labelKey: 'HOME.STACK.BOTH', badges: [['Flutter', '02569B', 'flutter']] },
    { labelKey: 'HOME.STACK.SELF_TAUGHT', badges: [['Angular', 'DD0031', 'angular'], ['TypeScript', '3178C6', 'typescript'], ['Kotlin', '7F52FF', 'kotlin']] }
  ].map(group => ({
    labelKey: group.labelKey,
    badges: group.badges.map(([name, color, logo, logoColor = 'white']) => ({
      name,
      url: `https://img.shields.io/badge/${encodeURIComponent(name)}-${color}?style=for-the-badge&logo=${logo}&logoColor=${logoColor}`
    }))
  }));

  pathGroups: { titleKey: string; steps: { dateKey: string; titleKey: string; placeKey: string; toolsKey?: string }[] }[] = [
    {
      titleKey: 'HOME.PATH.WORK',
      steps: [
        { dateKey: 'HOME.PATH.STELLANTIS_DATE', titleKey: 'HOME.PATH.STELLANTIS_TITLE', placeKey: 'HOME.PATH.STELLANTIS_PLACE', toolsKey: 'HOME.PATH.STELLANTIS_TOOLS' },
        { dateKey: 'HOME.PATH.ISL_DATE', titleKey: 'HOME.PATH.ISL_TITLE', placeKey: 'HOME.PATH.ISL_PLACE', toolsKey: 'HOME.PATH.ISL_TOOLS' }
      ]
    },
    {
      titleKey: 'HOME.PATH.EDUCATION',
      steps: [
        { dateKey: 'HOME.PATH.MASTER_DATE', titleKey: 'HOME.PATH.MASTER_TITLE', placeKey: 'HOME.PATH.UHA_PLACE' },
        { dateKey: 'HOME.PATH.LICENCE_DATE', titleKey: 'HOME.PATH.LICENCE_TITLE', placeKey: 'HOME.PATH.UHA_PLACE' }
      ]
    }
  ];

  projects = [
    { year: '2023 – 2024', roleKey: 'PROJECTS.ROLES.IT_SPECIALIST', titleKey: 'HOME.PROJECTS.EFA_TITLE', textKey: 'HOME.PROJECTS.EFA_TEXT', imageUrl: './assets/aviron.jpg' },
    { year: '2024 – 2025', roleKey: 'PROJECTS.ROLES.PROJECT_LEAD', titleKey: 'HOME.PROJECTS.MAZE_TITLE', imageUrl: './assets/labyrinthe.jpg' },
    { year: '2024 – 2025', roleKey: 'PROJECTS.ROLES.DEVELOPER', titleKey: 'HOME.PROJECTS.IMAGE_TITLE', textKey: 'HOME.PROJECTS.IMAGE_TEXT', imageUrl: './assets/imgprocessorapp.jpg' }
  ];
}
