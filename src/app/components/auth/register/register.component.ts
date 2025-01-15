import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ICreateUser } from '../../../models/user.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthdate: '', 
    biography: '',
    phoneNumber: ''
  };

  isLoading = false;

  constructor(private authService: AuthService) {}

  onRegister() {
    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const userData: ICreateUser = {
      email: this.user.email,
      password: this.user.password,
      name: this.user.name,
      birthdate: this.user.birthdate, 
      biography: this.user.biography,
      phoneNumber: this.user.phoneNumber,
    };

    this.isLoading = true;
    this.authService.register(userData).subscribe({
      next: (registeredUser) => {
        console.log('Registration successful:', registeredUser);
        alert('Registration completed successfully!');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error during registration:', err);
        alert('An error occurred while registering.');
        this.isLoading = false;
      }
    });
  }
}
