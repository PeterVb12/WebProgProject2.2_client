import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';

@Component({
  selector: 'app-activity-map',
  templateUrl: './activity-map.component.html',
  styleUrls: ['./activity-map.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class ActivityMapComponent {
  searchQuery: string = ''; 
  private map!: L.Map;
  private provider = new OpenStreetMapProvider(); 

  private events = [
    { name: 'Event 1', lat: 52.3676, lng: 4.9041, description: 'Amsterdam Event' },
    { name: 'Event 2', lat: 51.4416, lng: 5.4697, description: 'Eindhoven Event' },
    { name: 'Event 3', lat: 53.2194, lng: 6.5665, description: 'Groningen Event' }
  ];


  ngOnInit(): void {
    this.initMap();
    this.addMarkers();
  }

  private initMap(): void {
    this.map = L.map('map').setView([52.3676, 4.9041], 7); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  private addMarkers(): void {
    this.events.forEach(event => {
      const marker = L.marker([event.lat, event.lng])
        .addTo(this.map)
        .bindPopup(`<b>${event.name}</b><br>${event.description}`);
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
