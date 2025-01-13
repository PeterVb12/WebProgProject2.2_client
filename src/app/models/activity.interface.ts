export interface Activity {
    id: string; 
    title: string;
    description?: string; 
    date: Date;
    minParticipants: number;
    maxParticipants: number;
    cost?: number; 
    organizerId: string; 
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  }