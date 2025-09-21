import { Component } from '@angular/core';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  imports: [NgbAlertModule, RouterLink, TranslateModule],
  standalone: true,
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound {

}
