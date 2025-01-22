export interface Activity {
    id: string; 
    title: string;
    description?: string; 
    date: Date;
    minParticipants: number;
    maxParticipants: number;
    cost?: number; 
    OrganizerId?: string; 
    organizerName?: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    status: Status
  }

export enum Status {
  New = 0,
  SignedUp = 1,
  Viewed = 2,
}