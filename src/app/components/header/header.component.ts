import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { IUserIdentity } from '../../models/user.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  @Input() title: string | undefined;
  isNavbarCollapsed = true;
  loggedInUser$?: Observable<IUserIdentity | undefined>;

  constructor(private authService: AuthService){}

  ngOnInit(): void {
    this.loggedInUser$ = this.authService.currentUser$
  }

  logout(): void {
    this.authService.logout();
  }
}
