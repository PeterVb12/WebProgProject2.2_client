import { Component, OnInit, LOCALE_ID, OnDestroy } from '@angular/core';
import { ActivityService } from '../activity.service';
import { Activity } from '../../../models/activity.interface';
import { CommonModule } from '@angular/common';
import localeNl from '@angular/common/locales/nl';
import { registerLocaleData } from '@angular/common';
import { Router } from '@angular/router';

registerLocaleData(localeNl);

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  providers: [
    { provide: LOCALE_ID, useValue: 'nl' } 
  ],
  templateUrl: './activity-timeline.component.html',
  styleUrls: ['./activity-timeline.component.css'],
})
export class ActivityTimelineComponent implements OnInit, OnDestroy {
  activities: Activity[] = [];
  timelineWidth = 0;

  constructor(private activityService: ActivityService, private router: Router) {}

  ngOnInit(): void {
    this.calculateTimelineWidth();
    this.loadActivities();
    window.addEventListener('resize', this.calculateTimelineWidth.bind(this)); 
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.calculateTimelineWidth.bind(this));
  }

  loadActivities(): void {
    this.activityService.getParticipatingActivities().subscribe({
      next: (data) => {
        this.activities = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        this.calculateTimelineWidth();
      },
      error: (err) => {
        console.error('Error fetching activities', err);
      },
    });
  }

  onMarkerClick(activityId: string): void {
    this.router.navigate(['detailsactivity', activityId]);
  }

  calculateTimelineWidth(): void {
    const cardWidth = 250; 
    const gap = window.innerWidth * 0.05; 
    const padding = window.innerWidth * 0.02; 


    const totalWidth = this.activities.length * (cardWidth + gap);

    const maxWidth = Math.min(totalWidth + padding * 2, window.innerWidth); 

    this.timelineWidth = maxWidth; 
  }
  
}
