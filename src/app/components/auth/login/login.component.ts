import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { IUserIdentity } from "../../../models/user.interface";
import { Component } from "@angular/core";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm!: FormGroup;
  subs?: Subscription;
  submitted = false;
  errorMessage: string = ''; 
  showErrorAlert: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    console.log('Initializing LoginComponent...');
    this.loginForm = new FormGroup({
      email: new FormControl(null, [
        Validators.required,
        this.validEmail.bind(this),
      ]),
      password: new FormControl(null, [
        Validators.required,
        this.validPassword.bind(this),
      ]),
    });

    console.log('Login form initialized:', this.loginForm.value);

    this.subs = this.authService
      .getUserFromLocalStorage()
      .subscribe((user: IUserIdentity | undefined) => {
        if (user) {
          console.log('User already logged in > navigating to dashboard.');
          this.router.navigate(['/']);
        } else {
          console.log('No user logged in.');
        }
      });
  }

  ngOnDestroy(): void {
    if (this.subs) {
      console.log('Unsubscribing from AuthService.');
      this.subs.unsubscribe();
    }
  }

  onSubmit(): void {
    console.log('Submit button clicked.');
    console.log('Form validity:', this.loginForm.valid);
    console.log('Form values:', this.loginForm.value);
  
    if (this.loginForm.valid) {
      this.submitted = true;
      this.errorMessage = ''; 
      this.showErrorAlert = false;
  
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;
  
      console.log('Attempting login with email:', email);
  
      this.authService.login(email, password).subscribe({
        next: (user: IUserIdentity | undefined) => {
          if (user) {
            console.log('Login successful. User received:', user);
            this.router.navigate(['/']);
            this.submitted = false; 
          } else {
            this.errorMessage = 'Onjuiste inloggegevens. Controleer uw e-mailadres en wachtwoord.';
            this.showErrorAlert = true;
            this.submitted = false; 
          }
        },
        error: (err) => {
          console.error('Login failed:', err);
          this.submitted = false; 
          if (err.status === 401) {
            this.errorMessage = 'Onjuiste inloggegevens. Controleer uw e-mailadres en wachtwoord.';
          } else if (err.status === 0) {
            this.errorMessage = 'Kan geen verbinding maken met de server. Probeer het later opnieuw.';
          } else {
            this.errorMessage = 'Er is een onverwachte fout opgetreden. Probeer het opnieuw.';
          }
          this.showErrorAlert = true;
  
          console.log('Error message displayed to user:', this.errorMessage);
        },
      });
    } else {
      console.error('loginForm invalid. Cannot submit.');
    }
  }
  
  

  validEmail(control: FormControl): { [s: string]: boolean } | null {
    const email = control.value;
    const regexp = new RegExp(
      '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'
    );
    const isValid = regexp.test(email);
    console.log('Validating email:', email, 'Valid:', isValid);
    return isValid ? null : { email: false };
  }

  validPassword(control: FormControl): { [s: string]: boolean } | null {
    const password = control.value;
    const regexp = new RegExp('^[a-zA-Z]([a-zA-Z0-9]){2,14}');
    const isValid = regexp.test(password);
    console.log('Validating password:', password, 'Valid:', isValid);
    return isValid ? null : { password: false };
  }
}
