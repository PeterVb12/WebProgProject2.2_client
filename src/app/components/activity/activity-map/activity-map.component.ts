import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-geometryutil';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { ActivityService } from '../activity.service';
import { Activity } from '../../../models/activity.interface';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import inside from 'point-in-polygon';


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
  private drawnItems!: L.FeatureGroup;

  constructor(
    private activityService: ActivityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initMap();
    this.sub = this.activityService.getActivitiesAsync().subscribe({
      next: (activities: Activity[]) => {
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
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polyline: false,
        marker: false,
        circlemarker: false,
        circle: {},
        rectangle: {},
        polygon: {},
      },
      edit: {
        featureGroup: this.drawnItems,
        remove: true,
      },
    });
    this.map.addControl(drawControl);

    this.map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      this.drawnItems.addLayer(layer);
      this.handleDrawnShape(layer);
    });
  }

  private addMarkers(): void {
    if (!this.activities) return;

    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    this.activities.forEach((activity) => {
      L.marker([activity.latitude, activity.longitude])
        .addTo(this.map)
        .bindPopup(
          `<b>${activity.title}</b><br>${activity.description}<br><button onclick="document.dispatchEvent(new CustomEvent('markerClick', { detail: '${activity.id}' }))">Details</button>`
        );
    });
  }

  private handleDrawnShape(layer: L.Layer): void {
    if (layer instanceof L.Circle) {
      const center = layer.getLatLng();
      const radius = layer.getRadius();
      this.filterActivitiesByCircle(center, radius);
    } else if (layer instanceof L.Polygon) {
      const bounds = (layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
      this.filterActivitiesByPolygon(bounds);
    }
  }

  private filterActivitiesByCircle(center: L.LatLng, radius: number): void {
    if (!this.activities) return;

    this.activities = this.activities.filter((activity) => {
      const distance = this.calculateDistance(
        center.lat,
        center.lng,
        activity.latitude,
        activity.longitude
      );
      return distance <= radius / 1000;
    });

    this.addMarkers();
  }

  private filterActivitiesByPolygon(bounds: L.LatLng[]): void {
    if (!this.activities) return;
  
    const polygon = bounds.map((latlng) => [latlng.lat, latlng.lng]);
  
    this.activities = this.activities.filter((activity) =>
      inside([activity.latitude, activity.longitude], polygon)
    );
  
    this.addMarkers();
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const toRad = (val: number) => (val * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
