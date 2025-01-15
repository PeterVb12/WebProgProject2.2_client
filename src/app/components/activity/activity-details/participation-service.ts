import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
  })
  export class ParticipationService {
    private readonly apiUrl = 'https://localhost:7061/api/Participation';
  
    constructor(private http: HttpClient) {}
  
    participate(activityId: string, token: string) {
      const userId = this.decodeToken(token)?.sub;
      if (!userId) {
        throw new Error('Invalid token: User ID not found.');
      }
  
      const url = `${this.apiUrl}/${activityId}`;
      return this.http.post(url, { userId });
    }
  
    private decodeToken(token: string): any {
      try {
        const payload = token.split('.')[1];
        const decodedPayload = atob(payload);
        return JSON.parse(decodedPayload);
      } catch (error) {
        console.error('Error decoding token', error);
        return null;
      }
    }
  }
  