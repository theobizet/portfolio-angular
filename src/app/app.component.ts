import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavigationBarComponent } from './component/navigation-bar/navigation-bar.component';
import { ChatComponent } from './component/chat/chat';
import { ThemeService } from './theme.service';
import { TranslateModule, TranslateService } from "@ngx-translate/core";

const LANGUAGES = ['fr', 'de', 'en'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationBarComponent, ChatComponent, TranslateModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  readonly year = new Date().getFullYear();

  constructor(
    private readonly themeService: ThemeService, private readonly translate: TranslateService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    this.translate.addLangs(LANGUAGES);
    this.translate.setFallbackLang('fr');
    this.loadLanguage();
  }

  /** Langue enregistrée, sinon celle du navigateur si le site la propose, sinon le français. */
  private loadLanguage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const browserLang = navigator.language.slice(0, 2);
      const lang = localStorage.getItem('local') ?? (LANGUAGES.includes(browserLang) ? browserLang : 'fr');
      this.translate.use(lang);
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.themeService.darkMode$.subscribe(darkMode => {
        document.documentElement.dataset['bsTheme'] = darkMode ? 'dark' : 'light';
      });
      // Les lecteurs d'écran et la traduction automatique lisent la langue sur <html>.
      this.translate.onLangChange.subscribe(({ lang }) => {
        document.documentElement.lang = lang;
      });
    }
  }
}
