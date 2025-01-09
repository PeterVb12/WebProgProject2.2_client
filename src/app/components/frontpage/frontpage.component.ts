import { Component } from '@angular/core';
import { NgbAlertModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-frontpage',
  standalone: true,
  templateUrl: './frontpage.component.html',
  styleUrl: './frontpage.component.css',
  imports: [NgbAlertModule, NgbDropdownModule],
})
export class FrontpageComponent {

}
