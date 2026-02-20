export type Role = 'KEEPER' | 'INVESTIGATOR';

export interface User {
    id: string;
    username: string;
    role: Role;
    // In a real app, password should never be in client state.
    // We only use this interface for the "session" user, so keeping it clean.
}

// For localStorage storage
export interface StoredUser extends User {
    password: string; // Stored in cleartext for this mock
}
