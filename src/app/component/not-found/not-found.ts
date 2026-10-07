import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleArrowLeft, faEnvelope, faLightbulb, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslateModule, FontAwesomeModule],
  standalone: true,
  templateUrl: './not-found.html'
})
export class NotFound {
  readonly icons = { warning: faTriangleExclamation, back: faCircleArrowLeft, email: faEnvelope, tip: faLightbulb };
}
