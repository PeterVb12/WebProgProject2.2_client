import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { ActivityService } from '../activity.service';
import { Activity } from '../../../models/activity.interface';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-activity-map',
  templateUrl: './activity-map.component.html',
  styleUrls: ['./activity-map.component.css'],
  standalone: true,
  imports: [FormsModule, HttpClientModule],
})
export class ActivityMapComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  private map!: L.Map;
  private provider = new OpenStreetMapProvider();
  private activities: Activity[] | undefined;
  sub: Subscription | undefined;

  constructor(
    private activityService: ActivityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initMap();
    console.log("evenementen worden opgehaald")
    this.sub = this.activityService.getActivitiesAsync().subscribe({
      next: (activities) => {
        this.activities = activities;
        this.addMarkers();
      },
      error: (err) => {
        console.error('Error fetching activities:', err);
      },
    });
  }

  private initMap(): void {
    this.map = L.map('map').setView([52.3676, 4.9041], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  private addMarkers(): void {
    if (!this.activities) {
      return;
    }
    this.activities.forEach((activity) => {
      const marker = L.marker([activity.latitude, activity.longitude])
        .addTo(this.map)
        .bindPopup(
          `<b>${activity.title}</b><br>${activity.description}<br><button onclick="document.dispatchEvent(new CustomEvent('markerClick', { detail: '${activity.id}' }))">Details</button>`
        );
    });

    document.addEventListener('markerClick', (e: any) => {
      this.onMarkerClick(e.detail);
    });
  }

  onMarkerClick(activityId: string): void {
    this.router.navigate(['detailsactivity', activityId]);
  }

  async searchLocation(): Promise<void> {
    if (!this.searchQuery) {
      alert('Please enter a location');
      return;
    }

    try {
      const results = await this.provider.search({ query: this.searchQuery });

      if (results.length > 0) {
        const { x: lng, y: lat, label } = results[0];
        this.map.setView([lat, lng], 18);

        L.marker([lat, lng])
          .addTo(this.map)
          .bindPopup(`<b>${label}</b>`)
          .openPopup();
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error('Error searching for location:', error);
      alert('An error occurred while searching for the location.');
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
