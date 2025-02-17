import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-geometryutil';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { ActivityService } from '../activity.service';
import { Activity, Status } from '../../../models/activity.interface';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import inside from 'point-in-polygon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activity-map',
  templateUrl: './activity-map.component.html',
  styleUrls: ['./activity-map.component.css'],
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
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
    this.customizeLeafletDrawLabels();
    this.sub = this.activityService.getActivitiesAsync().subscribe({
      next: (activities: Activity[]) => {
        console.log('Ontvangen activiteiten van backend:', activities);
        this.activities = activities;
        this.addMarkers();
      },
      error: (err) => {
        console.error('Error fetching activities:', err);
      },
    });

    
  }

  showInfoAlert = false;
  infoMessage = '';

  showInfo(): void {
    this.infoMessage = `Welkom! Gebruik de kaart om evenementen te bekijken:
    - Klik op een knop om een vorm te tekenen
    - Typ een locatie in de zoekbalk en druk op Enter of klik op "Zoek naar uw locatie" om de kaart te verplaatsen.
    - Gebruik de legenda (Gezien, Nieuw, Ingeschreven) om specifieke evenementen te bekijken.`;
    
    this.showInfoAlert = true;

    setTimeout(() => {
      this.showInfoAlert = false;
    }, 100000); 
  }

  private customizeLeafletDrawLabels(): void {
    L.drawLocal.draw.toolbar.actions.title = 'Annuleer tekenen';
    L.drawLocal.draw.toolbar.actions.text = 'Annuleren';
    L.drawLocal.draw.toolbar.finish.title = 'Voltooi tekenen';
    L.drawLocal.draw.toolbar.finish.text = 'Opslaan';
    L.drawLocal.draw.toolbar.undo.title = 'Verwijder het laatste punt';
    L.drawLocal.draw.toolbar.undo.text = 'Laatste punt verwijderen';
    L.drawLocal.draw.toolbar.buttons.polyline = 'Teken een lijn';
    L.drawLocal.draw.toolbar.buttons.polygon = 'Teken een veelhoek';
    L.drawLocal.draw.toolbar.buttons.rectangle = 'Teken een rechthoek';
    L.drawLocal.draw.toolbar.buttons.circle = 'Teken een cirkel';
    L.drawLocal.draw.toolbar.buttons.marker = 'Plaats een marker';
    L.drawLocal.draw.toolbar.buttons.circlemarker = 'Plaats een cirkelmarker';

    L.drawLocal.edit.toolbar.actions.save.title = 'Sla wijzigingen op';
    L.drawLocal.edit.toolbar.actions.save.text = 'Opslaan';
    L.drawLocal.edit.toolbar.actions.cancel.title = 'Annuleer wijzigingen';
    L.drawLocal.edit.toolbar.actions.cancel.text = 'Annuleren';
    L.drawLocal.edit.toolbar.buttons.edit = 'Bewerk de lagen';
    L.drawLocal.edit.toolbar.buttons.remove = 'Verwijder de lagen';

    L.drawLocal.edit.toolbar.actions.clearAll.text = "verwijder alles";
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

    this.map.on(L.Draw.Event.DELETED, () => {
      this.resetActivities(); 
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
    console.log('Activiteiten:', this.activities);
    // Verwijder bestaande markers
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    // Voeg nieuwe markers toe
    this.activities.forEach((activity) => {
      const popupContent = `
        <div style="text-align: center; padding: 10px; font-family: Arial, sans-serif;">
          <h3 style="margin: 5px 0; color: #a9564d; font-size: 1.2rem;">${activity.title}</h3>
          <p style="margin: 5px 0; font-size: 0.9rem; color: #555;">${activity.description || "Geen beschrijving beschikbaar"}</p>
          <button 
            id="detailsButton-${activity.id}" 
            style="
              background-color: #3E7056; 
              color: white; 
              border: none; 
              padding: 10px 20px; 
              font-size: 0.9rem; 
              border-radius: 5px; 
              cursor: pointer; 
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            "
          >
            Details
          </button>
        </div>
      `;


      const iconUrl = this.getMarkerIcon(activity.status);
      console.log(`Marker icon for Activity ID ${activity.id}: ${iconUrl}`);
      const markerIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      const marker = L.marker([activity.latitude, activity.longitude], { icon: markerIcon })
        .addTo(this.map)
        .bindPopup(popupContent);

      marker.on('popupopen', () => {
        const detailsButton = document.getElementById(`detailsButton-${activity.id}`);
        if (detailsButton) {
          detailsButton.addEventListener('click', () => this.handleMarkerClick(activity.id));
        }
      });
    });
  }


  private handleMarkerClick(activityId: string): void {
    console.log('Marker clicked for activity ID:', activityId);
    this.router.navigate(['/detailsactivity', activityId]);  
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
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error('Error searching for location:', error);
      alert('An error occurred while searching for the location.');
    }  
  }

  private getMarkerIcon(status: string | Status): string {
    const statusEnum = typeof status === 'string' ? Status[status as keyof typeof Status] : status;
    console.log('Geconverteerde status:', statusEnum);
    
    switch (statusEnum) {
      case Status.New:
        return '../../../../assets/markers/red-marker.png';
      case Status.SignedUp:
        return '../../../../assets/markers/green-marker.png';
      case Status.Viewed:
        return '../../../../assets/markers/blue-marker.png';
      default:
        return '../../../../assets/markers/red-marker.png';
    }
  }

  private resetActivities(): void {
    this.activityService.getActivitiesAsync().subscribe({
      next: (activities: Activity[]) => {
        console.log('Activiteiten opnieuw geladen:', activities);
        this.activities = activities;
        this.addMarkers(); 
      },
      error: (err) => {
        console.error('Error fetching activities:', err);
      },
    });
  }
  
  

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
