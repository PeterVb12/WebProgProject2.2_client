import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment.development';

interface ParticipatingActivity {
  id: string;
  title: string;
  date: string;
  registeredAt: string;
  address: string;
  city: string;
}

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [
      { provide: LOCALE_ID, useValue: 'nl' }  // Zet de locale naar Nederlands
    ],
})
export class ActivityListComponent implements OnInit {
  activities: ParticipatingActivity[] = [];
  private readonly participationApi = `${environment.BackendApiUrl}/Participation`;
  token: string | null = localStorage.getItem('currentuser');

  constructor(private http: HttpClient,
              private authService: AuthService, private router: Router
  ) {}

  ngOnInit(): void {
    if (this.token) {
      this.loadParticipatingActivities();
    } else {
      console.error('User is not logged in.');
    }
  }

  onMarkerClick(activityId: string): void {
    this.router.navigate(['detailsactivity', activityId]);
  }

  selectedActivity: any = null;  // Holds the activity details

  toggleDetails(activity: any) {
    // Toggle the visibility of activity details when clicked
    if (this.selectedActivity === activity) {
      this.selectedActivity = null;  // Deselect if clicked again
    } else {
      this.selectedActivity = activity;  // Select activity to show details
    }
  }

  private loadParticipatingActivities(): void {
    const token = this.authService.getTokenFromLocalStorage()
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<ParticipatingActivity[]>(this.participationApi, { headers }).subscribe({
      next: (activities) => {
        this.activities = activities;
      },
      error: (err) => {
        console.error('Error fetching participating activities:', err);
      },
    });
  }

  exitDetails() {
    // Close the details view
    this.selectedActivity = null;
  }
}
