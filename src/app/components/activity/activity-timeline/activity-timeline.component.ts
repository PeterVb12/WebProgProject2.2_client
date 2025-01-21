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
    { provide: LOCALE_ID, useValue: 'nl' }  // Zet de locale naar Nederlands
  ],
  templateUrl: './activity-timeline.component.html',
  styleUrls: ['./activity-timeline.component.css'],
})
export class ActivityTimelineComponent implements OnInit, OnDestroy {
  activities: Activity[] = [];
  timelineWidth = 0; // Variabele voor de breedte van de lijn

  constructor(private activityService: ActivityService, private router: Router) {}

  ngOnInit(): void {
    this.calculateTimelineWidth();
    this.loadActivities();
    window.addEventListener('resize', this.calculateTimelineWidth.bind(this)); // Toevoegen van resize event listener
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.calculateTimelineWidth.bind(this)); // Verwijderen van event listener om geheugenlekken te voorkomen
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
    const cardWidth = 250; // Breedte van een card in pixels (dit blijft hetzelfde)
    const gap = window.innerWidth * 0.05; // Gap als percentage van de viewport breedte (5% van het scherm)
    const padding = window.innerWidth * 0.02; // Padding als percentage van de viewport breedte (2% van het scherm)

    // Bereken de totale breedte van de tijdlijn op basis van het aantal activiteiten
    const totalWidth = this.activities.length * (cardWidth + gap);

    // Beperk de breedte van de tijdlijn tot de breedte van het scherm, zodat deze niet breder wordt dan het scherm
    const maxWidth = Math.min(totalWidth + padding * 2, window.innerWidth); // Voeg padding toe aan de uiteindelijke breedte

    this.timelineWidth = maxWidth; // Zet de breedte van de tijdlijn
  }
  
}
