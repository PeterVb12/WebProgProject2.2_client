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

  participate(activityId: string): void {
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
    console.log(' Header:', headers);
  
    // Prepare the payload
    const participationData = {
      userId, // Extracted from the token
      activityId, // This is passed to the method
    };
  
    this.http.post(url, participationData, { headers }).subscribe({
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
