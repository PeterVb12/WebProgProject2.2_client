import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivityService } from '../activity.service';
import { Activity } from '../../../models/activity.interface';

@Component({
  selector: 'app-activity-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './activity-create.component.html',
  styleUrl: './activity-create.component.css'
})
export class ActivityCreateComponent {
  
  activity: any = {
    title: '',
    description: '',
    date: new Date(),
    minParticipants: 0,
    maxParticipants: 0,
    cost: 0,
    address: '',
    city: '',
  };

  constructor(private activityService: ActivityService) {}
  
  onFileSelected(activity: Activity): void {
    // const input = event.target as HTMLInputElement;
    // if (input.files && input.files[0]) {
    //   this.activity.photo = input.files[0];
    // }
  }
  
  createActivity() {
    console.log("create activity aangeroepen")
    this.activityService.createActivity(this.activity).subscribe(
      (response: any) => {
        console.log('Activiteit succesvol aangemaakt:', response);
        alert('Activiteit succesvol aangemaakt!');
      },
      (error: any) => {
        console.error('Fout bij het aanmaken van activiteit:', error);
        alert('Er ging iets mis, probeer het opnieuw.');
      }
    );
  }
}
