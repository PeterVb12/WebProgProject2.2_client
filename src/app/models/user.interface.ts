
export interface IUserCredentials {
    emailAddress: string;
    password: string;
}


export interface IUserIdentity {
    token?: string;
    id: string;                
    name: string;
    birthdate: string;         
    emailAddress: string;
    age: number;
    biography: string;
    phoneNumber: string;
    hobbys: string[];
    role: UserRole
}

export enum UserRole {
    User = 'User',
    Organisation = 'Organisation',
    Foundation = 'Foundation'
}
