import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { ActivityService } from '../activity.service';
import {Activity} from "../../../models/activity.interface"
import { Subscription } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-activity-map',
  templateUrl: './activity-map.component.html',
  styleUrls: ['./activity-map.component.css'],
  standalone: true,
  imports: [FormsModule, HttpClientModule]
})
export class ActivityMapComponent {
  searchQuery: string = ''; 
  private map!: L.Map;
  private provider = new OpenStreetMapProvider(); 

  private events = [
    { title: 'Event 1', lat: 52.3676, lng: 4.9041, description: 'Amsterdam Event' },
    { title: 'Event 2', lat: 51.4416, lng: 5.4697, description: 'Eindhoven Event' },
    { title: 'Event 3', lat: 53.2194, lng: 6.5665, description: 'Groningen Event' }
  ];

  private activities: Activity[] | undefined;
  sub: Subscription | undefined;

  constructor(
    private activityService: ActivityService
  ){}

  ngOnInit(): void {
    this.initMap();
  
    this.sub = this.activityService.getActivitiesAsync().subscribe({
      next: (activities) => {
        this.activities = activities;
        console.log('Activities in ngOnInit:', this.activities);
        this.addMarkers();
      },
      error: (err) => {
        console.error('Error while fetching activities:', err);
      }
    });
  }

  private initMap(): void {
    this.map = L.map('map').setView([52.3676, 4.9041], 7); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  private addMarkers(): void {
    if (!this.activities) {
      return;
    }
    this.activities.forEach(activity => {
      const marker = L.marker([activity.latitude, activity.longitude])
        .addTo(this.map)
        .bindPopup(`<b>${activity.title}</b><br>${activity.description}`);
    });
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
}
