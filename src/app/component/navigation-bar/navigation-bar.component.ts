import { RouterLink, RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../theme.service';
import { NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  imports: [RouterLink,FontAwesomeModule,CommonModule,RouterModule,NgbDropdownModule,NgbCollapseModule],
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.css'
})
export class NavigationBarComponent {
  isDarkTheme: boolean | undefined;
  isMenuCollapsed = true;

  constructor(public themeService: ThemeService) {
    this.themeService.darkMode$.subscribe(darkMode => {
      this.isDarkTheme = darkMode;
    });
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
