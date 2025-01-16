import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivityService } from '../activity.service';
import { Activity } from '../../../models/activity.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activity-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './activity-create.component.html',
  styleUrls: ['./activity-create.component.css'], // Corrected 'styleUrl' to 'styleUrls'
})
export class ActivityCreateComponent {
  activity: any = {
    title: '',
    description: '',
    date: '',
    minParticipants: 0,
    maxParticipants: 0,
    cost: 0,
    address: '',
    city: '',
  };

  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private activityService: ActivityService) {}

  validateActivity(): boolean {
    const now = new Date();
    const activityDate = new Date(this.activity.date);

    if (!this.activity.title.trim()) {
      this.errorMessage = 'Naam van de activiteit is verplicht.';
      return false;
    }
    if (!this.activity.description.trim()) {
      this.errorMessage = 'Beschrijving van de activiteit is verplicht.';
      return false;
    }
    if (!this.activity.date || isNaN(activityDate.getTime())) {
      this.errorMessage = 'Datum en tijd zijn verplicht.';
      return false;
    }
    if (activityDate < now) {
      this.errorMessage = 'De opgegeven datum en tijd zijn al verstreken.';
      return false;
    }
    if (this.activity.minParticipants < 1) {
      this.errorMessage = 'Minimale deelnemers moet ten minste 1 zijn.';
      return false;
    }
    if (this.activity.maxParticipants < 1) {
      this.errorMessage = 'Maximale deelnemers moet ten minste 1 zijn.';
      return false;
    }
    if (!this.activity.address.trim()) {
      this.errorMessage = 'Adres is verplicht.';
      return false;
    }
    if (!this.activity.city.trim()) {
      this.errorMessage = 'Stad is verplicht.';
      return false;
    }

    this.errorMessage = null; // Clear previous error if validation passes
    return true;
  }

  clearError(): void {
    this.errorMessage = null;
  }

  clearMessages() {
    this.errorMessage = null;
    this.successMessage = null;
  }

  createActivity(): void {
    if (!this.validateActivity()) {
      return;
    }

    this.activityService.createActivity(this.activity).subscribe(
      (response: any) => {
        console.log('Activiteit succesvol aangemaakt:', response);
        this.successMessage = 'Activiteit succesvol aangemaakt:'
      },
      (error: any) => {
        console.error('Fout bij het aanmaken van activiteit:', error);
        this.errorMessage = 'Fout bij het aanmaken van activiteit:'
      }
    );
  }
}
