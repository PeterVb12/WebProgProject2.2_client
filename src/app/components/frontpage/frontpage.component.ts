import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbAlertModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-frontpage',
  standalone: true,
  templateUrl: './frontpage.component.html',
  styleUrl: './frontpage.component.css',
  imports: [NgbAlertModule, NgbDropdownModule, RouterModule],
})
export class FrontpageComponent {

}
