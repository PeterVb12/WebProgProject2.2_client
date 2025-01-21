import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivityService } from '../activity.service';
import { Activity } from '../../../models/activity.interface';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtService } from '../JwtService';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ActivityDetailsComponent implements OnInit {
  event: Activity | undefined;
  private readonly participationApi = 'https://localhost:7061/api/Participation';
  token: string | null = localStorage.getItem('currentuser');
  successMessage: string = '';  // Success message for participation
  errorMessage: string = '';    // Error message for participation
  showSuccessAlert: boolean = false;  // Flag to show green alert
  showErrorAlert: boolean = false;    // Flag to show red alert

  constructor(
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private http: HttpClient,
    private jwtService: JwtService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const activityId = this.route.snapshot.paramMap.get('id');
    if (activityId) {
      this.activityService.getActivityById(activityId).subscribe({
        next: (activity) => {
          this.event = activity;
        },
        error: (err) => {
          console.error('Error fetching activity details:', err);
        },
      });
    }
  }

  participate(eventId: string): void {
    if (!eventId) {
      console.error('Event ID not found.');
      return;
    }
  
    console.log('Event data:', this.event); // Log event
    if (!this.event) {
      console.error('No event data available.');
      return;
    }
  
    this.activityService.participate(eventId).subscribe({
      next: (response) => {
        console.log('Response received:', response);
        if (response === 'Successfully registered for the activity.') {  
          this.successMessage = `U doet mee met ${this.event?.title}`;
          this.showSuccessAlert = true;
          setTimeout(() => this.showSuccessAlert = false, 10000);
        } else {
          this.errorMessage = 'Er is iets misgegaan bij het aanmelden voor het evenement.';
          this.showErrorAlert = true;
          setTimeout(() => this.showErrorAlert = false, 10000);
        }
      },
      error: (err) => {
        this.errorMessage = 'Er is iets misgegaan bij het aanmelden voor het evenement.';
        this.showErrorAlert = true;
        setTimeout(() => this.showErrorAlert = false, 10000);
        console.error('Error during participation:', err);
        console.error('Response body:', err.error);
      },
    });
  }

  cancelParticipation(activityId: string): void {
    const token = this.authService.getTokenFromLocalStorage();
    if (!token) {
      console.error('Token not found. Please log in.');
      return;
    }
  
    // Decode the token and extract the user ID
    const decodedToken = this.jwtService.decodeToken(token);
    const userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    if (!userId) {
      console.error('Invalid token: User ID not found.');
      return;
    }
  
    const url = `${this.participationApi}/${activityId}`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.delete(url, { headers }).subscribe({
      next: () => {
        console.log('Successfully canceled participation!');
      },
      error: (err) => {
        console.error('Error during cancellation:', err);
        console.error('Response body:', err.error);
      },
    });
  }
  
}
