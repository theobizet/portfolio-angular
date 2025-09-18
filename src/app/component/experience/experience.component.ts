import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbAccordionConfig, NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [NgbAccordionModule, CommonModule, TranslateModule],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.css'
})
export class ExperienceComponent {
  experiences = [
    { key: 'EXPERIENCE.LECLERC' },
    { key: 'EXPERIENCE.ISL_STAGE' },
    { key: 'EXPERIENCE.CERP_RRM' },
    { key: 'EXPERIENCE.GRG_ALSACE_DB' },
    { key: 'EXPERIENCE.BELL_SUISSE' },
    { key: 'EXPERIENCE.GRG_ALSACE_MANUT' },
    { key: 'EXPERIENCE.MATCH' },
    { key: 'EXPERIENCE.JOURNAL_ALSACE' },
    { key: 'EXPERIENCE.EARL_FIX' }
  ];

  constructor(config: NgbAccordionConfig) {
    config.closeOthers = true;
  }
}
