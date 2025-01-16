import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { ActivityService } from '../activity.service';
import { Activity } from '../../../models/activity.interface';
import { CommonModule } from '@angular/common';
import localeNl from '@angular/common/locales/nl';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeNl);

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  providers: [
    { provide: LOCALE_ID, useValue: 'nl' }  // Zet de locale naar Nederlands
  ],
  templateUrl: './activity-timeline.component.html',
  styleUrls: ['./activity-timeline.component.css'],
})
export class ActivityTimelineComponent implements OnInit {
  activities: Activity[] = [];

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.activityService.getParticipatingActivities().subscribe({
      next: (data) => {
        this.activities = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },
      error: (err) => {
        console.error('Error fetching activities', err);
      },
    });
  }
}
