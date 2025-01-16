import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface ParticipatingActivity {
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
  imports: [CommonModule],
})
export class ActivityListComponent implements OnInit {
  activities: ParticipatingActivity[] = [];
  private readonly participationApi = 'https://localhost:7061/api/Participation';
  token: string | null = localStorage.getItem('currentuser');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.token) {
      this.loadParticipatingActivities();
    } else {
      console.error('User is not logged in.');
    }
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
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

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
