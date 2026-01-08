import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../theme.service';
import { NgOptimizedImage, NgFor } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [NgOptimizedImage, TranslateModule, NgFor],
  templateUrl: './education.component.html',
  styleUrl: './education.component.css'
})
export class EducationComponent implements OnInit {
  isDarkTheme: boolean | undefined;
  uhaLanguages: string[] = [];
  uhaSkills: string[] = [];
  donBoscoSkills: string[] = [];
  selfTaughtSkills: string[] = [];

  constructor(
    public themeService: ThemeService,
    private translate: TranslateService
  ) {
    this.themeService.darkMode$.subscribe(darkMode => {
      this.isDarkTheme = darkMode;
    });
  }

  ngOnInit() {
    this.loadEducationData();
    
    // Recharger les données lors du changement de langue
    this.translate.onLangChange.subscribe(() => {
      this.loadEducationData();
    });
  }

  private loadEducationData() {
    // Charger les langages UHA
    this.translate.get('EDUCATION.UHA.LANGUAGES').subscribe((languages: any) => {
      this.uhaLanguages = Object.keys(languages).map(key => languages[key]);
    });

    // Charger les compétences UHA
    this.translate.get('EDUCATION.UHA.SKILLS').subscribe((skills: any) => {
      this.uhaSkills = Object.keys(skills).map(key => skills[key]);
    });

    // Charger les compétences Don Bosco
    this.translate.get('EDUCATION.DON_BOSCO.SKILLS').subscribe((skills: any) => {
      this.donBoscoSkills = Object.keys(skills).map(key => skills[key]);
    });

    // Charger les compétences autodidacte
    this.translate.get('EDUCATION.SELF_TAUGHT.SKILLS').subscribe((skills: any) => {
      this.selfTaughtSkills = Object.keys(skills).map(key => skills[key]);
    });
  }
}
