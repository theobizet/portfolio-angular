import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ThemeService } from '../../theme.service';
import { TranslateModule } from '@ngx-translate/core';
import { ChatComponent } from "../chat/chat";
import { ContactService } from '../../contact.service';

type SendStatus = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NgOptimizedImage, TranslateModule, ChatComponent, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  isDarkTheme: boolean | undefined;
  status: SendStatus = 'idle';

  private contactService = inject(ContactService);

  constructor(public themeService: ThemeService) {
    this.themeService.darkMode$.subscribe(darkMode => {
      this.isDarkTheme = darkMode;
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.status === 'sending') {
      form.control.markAllAsTouched();
      return;
    }

    this.status = 'sending';
    this.contactService.send(form.value).subscribe({
      next: (response) => {
        this.status = response.success ? 'sent' : 'error';
        if (response.success) form.resetForm();
      },
      error: () => {
        this.status = 'error';
      }
    });
  }
}
