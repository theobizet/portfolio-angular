import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface Job {
  key: string;
  current?: boolean;
  bullets: string[];
  skills: string[];
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.css'
})
export class ExperienceComponent {
  /** Expériences en informatique. Les compétences sont des identifiants traduits sous EXPERIENCE.SKILL. */
  jobs: Job[] = [
    {
      key: 'EXPERIENCE.JOBS.STELLANTIS',
      current: true,
      bullets: ['B1', 'B2', 'B3'],
      skills: ['POWER_APPS', 'POWER_AUTOMATE', 'POWER_BI', 'SHAREPOINT', 'DATA_ANALYSIS', 'REQUIREMENTS']
    },
    {
      key: 'EXPERIENCE.JOBS.ISL',
      bullets: ['B1', 'B2', 'B3'],
      skills: ['SQL', 'VBA', 'EXCEL', 'DATABASES', 'DATA_SECURITY', 'DOCUMENTATION']
    },
    {
      key: 'EXPERIENCE.JOBS.GRG',
      bullets: ['B1', 'B2', 'B3'],
      skills: ['ACCESS', 'DATA_MIGRATION', 'DATABASES', 'USER_TRAINING']
    }
  ];

  studentJobs = ['LECLERC', 'CERP', 'BELL', 'MATCH', 'GRG', 'EARL'].map(id => `EXPERIENCE.STUDENT.${id}`);

  /** Toutes les compétences, dans l'ordre d'apparition, avec le nombre d'expériences qui les utilisent. */
  skills = [...this.jobs
    .flatMap(job => job.skills)
    .reduce((counts, id) => counts.set(id, (counts.get(id) ?? 0) + 1), new Map<string, number>())]
    .map(([id, count]) => ({ id, count }));

  selected: string | null = null;

  toggle(skill: string) {
    this.selected = this.selected === skill ? null : skill;
  }

  matches(job: Job): boolean {
    return !this.selected || job.skills.includes(this.selected);
  }
}
