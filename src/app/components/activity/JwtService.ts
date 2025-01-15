import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      console.log(token.split(":"[0]+[1]+[2]+[3]))
      const decodedPayload = atob(payload);
      console.log(decodedPayload)
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }
}
