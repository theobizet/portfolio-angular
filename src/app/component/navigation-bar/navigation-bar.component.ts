import { RouterLink, RouterModule } from '@angular/router';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faCode, faGear, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../theme.service';
import { NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  imports: [
    RouterLink,
    FontAwesomeModule,
    CommonModule,
    RouterModule,
    NgbDropdownModule,
    NgbCollapseModule,
    TranslateModule
  ],
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.css'
})
export class NavigationBarComponent {
  isDarkTheme: boolean | undefined;
  isMenuCollapsed = true;
  readonly icons = { gear: faGear, sun: faSun, moon: faMoon, check: faCheck, code: faCode };
  readonly languages = [
    { id: 'fr', label: 'Français' },
    { id: 'en', label: 'English' },
    { id: 'de', label: 'Deutsch' }
  ];

  constructor(public readonly themeService: ThemeService, private readonly translate: TranslateService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    this.themeService.darkMode$.subscribe(darkMode => {
      this.isDarkTheme = darkMode;
    });
  }

  setDarkMode(dark: boolean) {
    if (dark !== !!this.isDarkTheme) {
      this.themeService.toggleDarkMode();
    }
  }

  get currentLang(): string {
    return this.translate.getCurrentLang() || 'fr';
  }

  changeLanguage(language: string) {
    const newSetting = language;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('local', newSetting.toString());
    }
    this.translate.use(newSetting);
  }
}
