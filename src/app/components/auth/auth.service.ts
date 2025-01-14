import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, switchMap } from 'rxjs';
import { IUserIdentity } from '../../models/user.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';

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
        private router: Router,
      ) {
        this.getUserFromLocalStorage()
          .pipe(
            // switchMap is overbodig als we validateToken() niet gebruiken...
            switchMap((user: IUserIdentity) => {
              if (user) {
                console.log('User found in local storage');
                this.currentUser$.next(user);
                //return this.validateToken(user);
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
        console.log(`login at ${environment.BackendApiUrl}/Account/login`);
    
        return this.http
        .post<{results:IUserIdentity}>(
            `${environment.BackendApiUrl}/Account/login`,
            { email: email, password: password },
            { headers: this.headers }
        )
        .pipe(
            map((response) => {
            const user = response.results; 
            this.saveUserToLocalStorage(user);
            this.currentUser$.next(user);
            return user;
            }),
            catchError((error: any) => {
            console.log('error:', error);
            console.log('error.message:', error.message);
            console.log('error.error.message:', error.error.message);
            return of(undefined);
            })
        );
    }
    
    register(userData: IUserIdentity): Observable<IUserIdentity | undefined> {
    console.log(`register at ${environment.BackendApiUrl}/Account/register`);
    console.log(userData);
    
    return this.http
        .post<IUserIdentity>(`${environment.BackendApiUrl}/Account/register`, userData, {
        headers: this.headers,
        })
        .pipe(
        map((user) => {
            //const user = new User(response);
            console.dir(user);
            return user;
        }),
        catchError((error: any) => {
            console.log('error:', error);
            console.log('error.message:', error.message);
            console.log('error.error.message:', error.error.message);
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
            // true when canDeactivate allows us to leave the page.
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
    
      getUserFromLocalStorage(): Observable<IUserIdentity> {
        const localUser = JSON.parse(localStorage.getItem(this.CURRENT_USER)!);
        return of(localUser);
      }
    
      private saveUserToLocalStorage(user: IUserIdentity): void {
        localStorage.setItem(this.CURRENT_USER, JSON.stringify(user));
      }
    
      userMayEdit(itemUserId: string): Observable<boolean> {
        return this.currentUser$.pipe(
          map((user: IUserIdentity | undefined) => (user ? user.id === itemUserId : false))
        );
      }
}