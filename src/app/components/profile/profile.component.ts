import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importeer de CommonModule voor Angular directives zoals ngIf en ngFor

@Component({
  selector: 'app-profile',
  standalone: true, // Maak de component standalone
  imports: [CommonModule], // Voeg hier CommonModule toe
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any; // Object om de user-gegevens op te slaan

  ngOnInit(): void {
    const userData = localStorage.getItem('currentuser');
    if (userData) {
      this.user = JSON.parse(userData); // Parseer de JSON-string naar een object
    } else {
      console.error('Geen gebruiker gevonden in localStorage.');
    }
  }
}
