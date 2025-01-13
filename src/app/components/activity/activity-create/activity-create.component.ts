import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-activity-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './activity-create.component.html',
  styleUrl: './activity-create.component.css'
})
export class ActivityCreateComponent {
  
  event = {
    name: '',
    photo: undefined,
    cost: 0,
    description: '',
    address: '',
    organizer: '',
  };

  
  onFileSelected(event: Event): void {
    // const input = event.target as HTMLInputElement;
    // if (input.files && input.files[0]) {
    //   this.event.photo = input.files[0];
    // }
  }
  
  createEvent(): void {
    console.log('Event Created:', this.event);

    // Example: Send the event to a server or local storage
    // const formData = new FormData();
    // formData.append('name', this.event.name);
    // if (this.event.photo) {
    //   formData.append('photo', this.event.photo);
    // }
    // formData.append('cost', this.event.cost.toString());
    // formData.append('description', this.event.description);
    // formData.append('address', this.event.address);
    // formData.append('organizer', this.event.organizer);

    // Send `formData` to a backend using HttpClient
    alert('Event created successfully!');
  }
}
