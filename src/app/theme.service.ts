import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly darkMode = new BehaviorSubject<boolean>(false);

  readonly darkMode$ = this.darkMode.asObservable();

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {
    this.loadDarkMode();
  }

  private loadDarkMode(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedMode = localStorage.getItem('darkmode');
      // Sans choix enregistré, on suit le thème du système.
      this.darkMode.next(savedMode === null
        ? matchMedia('(prefers-color-scheme: dark)').matches
        : savedMode === 'true');
    }
  }

  toggleDarkMode(): void {
    const newSetting = !this.darkMode.value;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('darkmode', newSetting.toString());
    }
    this.darkMode.next(newSetting);
  }

  isDarkMode(): boolean {
    return this.darkMode.value;
  }
}
