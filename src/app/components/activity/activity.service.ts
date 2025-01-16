import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environment.development";
import { Injectable } from "@angular/core";
import { Activity } from "../../models/activity.interface";
import { catchError, map, Observable, switchMap, tap, throwError } from "rxjs";
import { AuthService } from "../auth/auth.service";

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  constructor(
    private http: HttpClient,
    private authService: AuthService) {}

  getActivitiesAsync(): Observable<Activity[]> {
    const token = this.authService.getTokenFromLocalStorage();
    console.log('Opgehaald token:', token);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .get<Activity[]>(`${environment.BackendApiUrl}/Activity`, { headers }) 
      .pipe(
        tap((activities) => console.log('Opgehaalde evenementen:', activities)) 
      );
  }

  getActivityById(id: string): Observable<Activity> {
    return this.http.get<Activity>(`${environment.BackendApiUrl}/Activity/${id}`);
  }

  createActivity(activity: any): Observable<any> {
    console.log("evenement die aangemaakt wordt: " + activity);
    return this.authService.currentUser$.pipe(
      map((user) => {
        
        const parsedUser = user?.token ? JSON.parse(user.token) : user;
        console.log("Parsed user:", parsedUser);
        if (!parsedUser || !parsedUser.id) {
          throw new Error('Gebruiker is niet ingelogd of heeft geen geldig user ID.');
        }
        return { ...activity, OrganizerId: parsedUser.id };
      }),
      switchMap((activityWithUserId) =>
        this.http.post<any>(`${environment.BackendApiUrl}/Activity`, activityWithUserId)
      ),
      tap((createdActivity) =>
        console.log('Nieuw aangemaakt evenement:', createdActivity)
      )
    );
  }

  participate(activityId: string): Observable<any> {
    console.log("Gebruiker schrijft zich in voor evenement met ID:", activityId);
  
    return this.authService.currentUser$.pipe(
      map((user) => {
        const token = this.authService.getTokenFromLocalStorage();
        console.log('Opgehaald token:', token);
  
        if (!token) {
          throw new Error('Gebruiker is niet ingelogd of er is geen token beschikbaar.');
        }
  
        // Headers aanmaken
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // Zorg ervoor dat Content-Type is ingesteld
        });
  
        return { activityId, headers };
      }),
      switchMap(({ activityId, headers }) =>
        this.http.post<any>(
          `${environment.BackendApiUrl}/Participation/${activityId}`, 
          null, // Geen body vereist
          { headers } // Headers hier correct meegeven
        )
      ),
      tap((response) =>
        console.log('Deelname succesvol geregistreerd:', response)
      ),
      catchError((error) => {
        console.error('Fout bij inschrijving:', error);
        return throwError(() => new Error('De inschrijving is mislukt.'));
      })
    );
  }
  
  
  
}
