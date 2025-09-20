import { RouterLink, RouterModule } from '@angular/router';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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

  constructor(public themeService: ThemeService, private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.themeService.darkMode$.subscribe(darkMode => {
      this.isDarkTheme = darkMode;
    });
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  changeLanguage(language: string) {
    const newSetting = language;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('local', newSetting.toString());
    }
    this.translate.use(newSetting);
  }
}
