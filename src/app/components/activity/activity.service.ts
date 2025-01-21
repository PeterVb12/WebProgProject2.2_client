import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environment.development";
import { Injectable } from "@angular/core";
import { Activity } from "../../models/activity.interface";
import { map, Observable, switchMap, tap } from "rxjs";
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
    const token = this.authService.getTokenFromLocalStorage();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http
      .get<Activity>(`${environment.BackendApiUrl}/Activity/${id}`, { headers })
      .pipe(
        tap((activity) => console.log('Opgehaald evenement:', activity))
      );
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

  getParticipatingActivities(): Observable<Activity[]> {
    const token = this.authService.getTokenFromLocalStorage();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http
      .get<Activity[]>(`${environment.BackendApiUrl}/Participation`, { headers })
      .pipe(
        tap((activities) => console.log('Participating activities:', activities))
      );
  }
  
}
    // console.log("evenement die aangemaakt wordt: " + activity)
    // return this.http.post(`${environment.BackendApiUrl}/Activity`, activity)