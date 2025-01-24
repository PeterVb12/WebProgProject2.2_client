import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, switchMap } from 'rxjs';
import { ICreateUser, IUserIdentity } from '../../models/user.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public currentUser$ = new BehaviorSubject<IUserIdentity | undefined>(undefined);
  private readonly CURRENT_USER = 'currentuser';
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.getUserFromLocalStorage()
      .pipe(
        switchMap((user: IUserIdentity | undefined) => {
          if (user) {
            console.log('User found in local storage');
            this.currentUser$.next(user);
            return of(user);
          } else {
            console.log(`No current user found`);
            return of(undefined);
          }
        })
      )
      .subscribe(() => console.log('Startup auth done'));
  }

  login(email: string, password: string): Observable<IUserIdentity | undefined> {
    console.log(`Login request to backend`);
  
    return this.http
      .post<{ token: string }>(
        `${environment.BackendApiUrl}/Account/login`,
        { email, password },
        { headers: this.headers }
      )
      .pipe(
        map((response) => {
          const token = response.token;
          console.log('Token ontvangen:', token); 
          this.saveTokenToLocalStorage(token);
  
          const decodedToken: any = jwtDecode(token);
          console.log('Decoded token payload:', decodedToken); 
          const userId =
            decodedToken[
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
            ];
          if (!userId) {
            throw new Error('UserId is missing in the token payload.');
          }
          console.log('Decoded userId:', userId); 
  
          return userId;
        }),
        switchMap((userId) =>
          this.http.get<IUserIdentity>(`${environment.BackendApiUrl}/User/${userId}`).pipe(
            map((user) => {
              console.log('User ontvangen van backend:', user);
              this.currentUser$.next(user); 
              this.saveUserToLocalStorage(user); 
              console.log('currentUser$ updated:', this.currentUser$.value); 
              return user;
            })
          )
        ),
        catchError((error: any) => {
          console.error('Login failed. Full error object:', error);
          return of(undefined); 
        })
      );
  }
  
  
  
  
  

  register(userData: ICreateUser): Observable<IUserIdentity | undefined> {
    console.log(`Registering user at ${environment.BackendApiUrl}/Account/register`);
    console.log(userData);

    return this.http
      .post<IUserIdentity>(`${environment.BackendApiUrl}/Account/register`, userData, {
        headers: this.headers,
      })
      .pipe(
        map((user) => {
          console.log('Payload:', userData);
          console.log('User registered successfully:', user);
          const token = user.token; 
          this.saveTokenToLocalStorage(token!);
          this.currentUser$.next(user); 
          return user;
        }),
        catchError((error: any) => {
          console.error('Error during registration:', error);
          return of(undefined);
        })
      );
  }

  validateToken(userData: IUserIdentity): Observable<IUserIdentity | undefined> {
    const url = `${environment.BackendApiUrl}/Account/profile`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + userData.token,
      }),
    };

    console.log(`validateToken at ${url}`);
    return this.http.get<any>(url, httpOptions).pipe(
      map((response) => {
        console.log('token is valid');
        return response;
      }),
      catchError((error: any) => {
        console.log('Validate token Failed');
        this.logout();
        this.currentUser$.next(undefined);
        return of(undefined);
      })
    );
  }

  logout(): void {
    this.router
      .navigate(['/'])
      .then((success) => {
        if (success) {
          console.log('logout - removing local user info');
          localStorage.removeItem(this.CURRENT_USER);
          this.currentUser$.next(undefined);
        } else {
          console.log('navigate result:', success);
        }
      })
      .catch((error) => console.log('not logged out!'));
  }

  getUserFromLocalStorage(): Observable<IUserIdentity | undefined> {
    const token = localStorage.getItem(this.CURRENT_USER); 
    if (token) {
      const user: IUserIdentity = { token } as IUserIdentity;
      return of(user);
    }
    return of(undefined);
  }

  private saveTokenToLocalStorage(token: string): void {
    console.log('Token opgeslagen:', token);
    localStorage.setItem("tokenLocalStorage", token); 
  }

  getTokenFromLocalStorage(): string | null {
    return localStorage.getItem("tokenLocalStorage");
  }

  private saveUserToLocalStorage(user: IUserIdentity): void {
    localStorage.setItem(this.CURRENT_USER, JSON.stringify(user));
  }
  

  userMayEdit(itemUserId: string): Observable<boolean> {
    return this.currentUser$.pipe(
      map((user: IUserIdentity | undefined) => (user ? user.id === itemUserId : false))
    );
  }

  isLoggedIn(): boolean {
    return !!this.currentUser$.value;
  }
}
