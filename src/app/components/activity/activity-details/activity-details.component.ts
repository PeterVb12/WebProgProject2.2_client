import { Component } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
@Component({
  selector: 'app-activity-details',
  standalone: true,
  imports: [CommonModule,NgStyle],
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.css'],
})
export class ActivityDetailsComponent {
  event = {
    name: 'Bingo avond',
    description: 'Bingo',
    cost: 25,
    address: '6025BA, Roosendaal',
    photoUrl: '',
  };

  organizer = {
    name: 'Peter Hoog',
    profilePictureUrl: '',
  };
}
