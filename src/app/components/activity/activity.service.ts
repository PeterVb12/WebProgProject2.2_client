import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment.development";
import { Injectable } from "@angular/core";
import { Activity } from "../../models/activity.interface";
import { Observable, tap } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  constructor(private http: HttpClient) {}

  getActivitiesAsync(): Observable<Activity[]> {
    return this.http
      .get<Activity[]>(`${environment.BackendApiUrl}/Activity`) // Let op: verwacht een array
      .pipe(
        tap((activities) => console.log('Opgehaalde evenementen:', activities)) // Log de activiteiten
      );
  }

  getActivityById(id: string): Observable<Activity> {
    return this.http.get<Activity>(`${environment.BackendApiUrl}/Activity/${id}`);
  }
}
