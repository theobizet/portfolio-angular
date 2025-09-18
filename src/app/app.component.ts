import { Component, Inject, OnInit, PLATFORM_ID ,inject} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavigationBarComponent } from './component/navigation-bar/navigation-bar.component';
import { ThemeService } from './theme.service';
import {
    TranslateService,
    TranslatePipe,
    TranslateDirective
} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationBarComponent, TranslatePipe, TranslateDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'CV-Theo-BIZET';
  constructor(
    private themeService: ThemeService, private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.translate.addLangs(['fr', 'de', 'en']);
    this.translate.setFallbackLang('fr');
    this.loadLanguage();
  }

  private loadLanguage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedLocal = localStorage.getItem('local');
      if (savedLocal !== null) {
        this.translate.use(savedLocal);
      }
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.themeService.darkMode$.subscribe(darkMode => {
        document.documentElement.setAttribute('data-bs-theme', darkMode ? 'dark' : 'light');
      });
    }
  }
}
