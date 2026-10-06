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

  path = [
    { dateKey: 'HOME.PATH.STELLANTIS_DATE', titleKey: 'HOME.PATH.STELLANTIS_TITLE', placeKey: 'HOME.PATH.STELLANTIS_PLACE', toolsKey: 'HOME.PATH.STELLANTIS_TOOLS' },
    { dateKey: 'HOME.PATH.MASTER_DATE', titleKey: 'HOME.PATH.MASTER_TITLE', placeKey: 'HOME.PATH.UHA_PLACE' },
    { dateKey: 'HOME.PATH.ISL_DATE', titleKey: 'HOME.PATH.ISL_TITLE', placeKey: 'HOME.PATH.ISL_PLACE', toolsKey: 'HOME.PATH.ISL_TOOLS' },
    { dateKey: 'HOME.PATH.LICENCE_DATE', titleKey: 'HOME.PATH.LICENCE_TITLE', placeKey: 'HOME.PATH.UHA_PLACE' }
  ];

  projects = [
    { year: '2023 – 2024', roleKey: 'PROJECTS.ROLES.IT_SPECIALIST', titleKey: 'HOME.PROJECTS.EFA_TITLE', textKey: 'HOME.PROJECTS.EFA_TEXT', imageUrl: './assets/aviron.jpg' },
    { year: '2024 – 2025', roleKey: 'PROJECTS.ROLES.PROJECT_LEAD', titleKey: 'HOME.PROJECTS.MAZE_TITLE', imageUrl: './assets/labyrinthe.jpg' },
    { year: '2024 – 2025', roleKey: 'PROJECTS.ROLES.DEVELOPER', titleKey: 'HOME.PROJECTS.IMAGE_TITLE', textKey: 'HOME.PROJECTS.IMAGE_TEXT', imageUrl: './assets/imgprocessorapp.jpg' }
  ];
}
