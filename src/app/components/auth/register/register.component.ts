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
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user = {
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthdate: '',
    biography: '',
    phoneNumber: '',
  };

  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  passwordErrors: string[] = [];

  constructor(private authService: AuthService) {}

  /**
   * Controleert de ingevoerde wachtwoordcriteria en toont fouten als deze niet worden voldaan.
   */
  checkPassword() {
    this.passwordErrors = [];
    const password = this.user.password;

    if (password.length < 8) {
      this.passwordErrors.push('Het wachtwoord moet minstens 8 tekens lang zijn.');
    }
    if (!/[A-Z]/.test(password)) {
      this.passwordErrors.push('Het wachtwoord moet minstens één hoofdletter bevatten.');
    }
    if (!/[a-z]/.test(password)) {
      this.passwordErrors.push('Het wachtwoord moet minstens één kleine letter bevatten.');
    }
    if (!/[0-9]/.test(password)) {
      this.passwordErrors.push('Het wachtwoord moet minstens één cijfer bevatten.');
    }
    if (!/[@$!%*?&]/.test(password)) {
      this.passwordErrors.push('Het wachtwoord moet minstens één speciaal teken bevatten (@, $, !, %, *, ?, &).');
    }
  }

  /**
   * Controleert of de ingevoerde e-mail geldig is.
   */
  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Behandelt de registratieactie wanneer het formulier wordt verzonden.
   */
  onRegister() {
    // Reset berichten
    this.errorMessage = null;
    this.successMessage = null;

    // Controleer op ontbrekende velden
    if (!this.user.email) {
      this.errorMessage = 'E-mailadres is verplicht.';
      return;
    }

    if (!this.isEmailValid(this.user.email)) {
      this.errorMessage = 'Voer een geldig e-mailadres in.';
      return;
    }

    if (!this.user.password) {
      this.errorMessage = 'Wachtwoord is verplicht.';
      return;
    }

    if (!this.user.confirmPassword) {
      this.errorMessage = 'Bevestig wachtwoord is verplicht.';
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'Wachtwoorden komen niet overeen.';
      return;
    }

    if (!this.user.name) {
      this.errorMessage = 'Naam is verplicht.';
      return;
    }

    if (!this.user.birthdate) {
      this.errorMessage = 'Geboortedatum is verplicht.';
      return;
    }

    if (!this.user.biography) {
      this.errorMessage = 'Biografie is verplicht.';
      return;
    }

    if (!this.user.phoneNumber) {
      this.errorMessage = 'Telefoonnummer is verplicht.';
      return;
    }

    this.checkPassword();
    if (this.passwordErrors.length > 0) {
      this.errorMessage = 'Het wachtwoord voldoet niet aan de vereisten.';
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
        console.log('Registratie succesvol:', registeredUser);

        this.authService.login(this.user.email, this.user.password).subscribe({
          next: (loggedInUser) => {
            console.log('Inloggen succesvol:', loggedInUser);
            this.successMessage = 'Registratie en inloggen voltooid!';
            this.isLoading = false;
            window.location.href = '/'; 
          },
          error: (err) => {
            console.error('Inloggen mislukt:', err);
            this.errorMessage =
              'Registratie voltooid, maar inloggen mislukt. Probeer later opnieuw.';
            this.isLoading = false;
          },
        });
      },
      error: (err) => {
        console.error('Fout tijdens registratie:', err);
        this.errorMessage =
          'Er is een fout opgetreden tijdens de registratie. Controleer je gegevens en probeer het opnieuw.';
        this.isLoading = false;
      },
    });
  }
}
