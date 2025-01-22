import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbAlertModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { IUserIdentity } from '../../models/user.interface';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-frontpage',
  standalone: true,
  templateUrl: './frontpage.component.html',
  styleUrl: './frontpage.component.css',
  imports: [NgbAlertModule, NgbDropdownModule, RouterModule,CommonModule],
})
export class FrontpageComponent {
  loggedInUser$?: Observable<IUserIdentity | undefined>;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loggedInUser$ = this.authService.currentUser$; // Observe de ingelogde gebruiker
  }
}
