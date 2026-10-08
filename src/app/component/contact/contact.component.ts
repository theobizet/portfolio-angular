import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClock, faCommentDots, faEnvelope, faFileLines, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { chatOpen } from '../chat/chat';
import { ContactService } from '../../contact.service';

type SendStatus = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [TranslateModule, FormsModule, FontAwesomeModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  status: SendStatus = 'idle';
  copied = false;
  readonly icons = { email: faEnvelope, linkedin: faLinkedinIn, github: faGithub, chat: faCommentDots };
  readonly chatFeatures = [
    { icon: faClock, key: 'CONTACT.CHAT.FEATURE_FAST' },
    { icon: faFileLines, key: 'CONTACT.CHAT.FEATURE_CV' },
    { icon: faGlobe, key: 'CONTACT.CHAT.FEATURE_LANGUAGE' }
  ];

  private readonly contactService = inject(ContactService);

  openChat(): void {
    chatOpen.set(true);
  }

  copyEmail(): void {
    navigator.clipboard?.writeText('theobizet@outlook.fr').then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    }).catch(() => {
      // Copie refusée par le navigateur : le lien mailto reste disponible.
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
