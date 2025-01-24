import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-profile',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any; 

  ngOnInit(): void {
    const userData = localStorage.getItem('currentuser');
    if (userData) {
      this.user = JSON.parse(userData); 
    } else {
      console.error('Geen gebruiker gevonden in localStorage.');
    }
  }
}
