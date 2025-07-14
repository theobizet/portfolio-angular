import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkMode.asObservable();

  toggleDarkMode() {
    this.darkMode.next(!this.darkMode.value);
  }
  isDarkMode(): boolean {
    return this.darkMode.value;
  }
}
// This service uses BehaviorSubject to manage the dark mode state.
// The `darkMode$` observable can be subscribed to in components to react to changes.
// The `toggleDarkMode` method toggles the dark mode state.
// The `isDarkMode` method returns the current state of dark mode.
