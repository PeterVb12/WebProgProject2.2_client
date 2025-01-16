import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivityService } from '../activity.service';
import { Activity } from '../../../models/activity.interface';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtService } from '../JwtService';


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

  constructor(
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private http: HttpClient,
    private jwtService: JwtService
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

  participate(eventId : string): void {
    if (!eventId || !eventId) {
      console.error('Event ID not found.');
      return;
    }

    this.activityService.participate(eventId).subscribe({
      next: () => {
        console.log('Participation successful!');
      },
      error: (err) => {
        console.error('Error during participation:', err);
        console.error('Response body:', err.error);
      },
    });
  }
}
