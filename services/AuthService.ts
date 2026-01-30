import { UserProfile } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class AuthService {
    private static tokenKey = 'clash_defense_token';

    static getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    static setToken(token: string) {
        localStorage.setItem(this.tokenKey, token);
    }

    static logout() {
        localStorage.removeItem(this.tokenKey);
        window.location.reload();
    }

    static async register(username: string, email: string, password: string): Promise<{ user: any, token: string }> {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        this.setToken(data.token);
        return data;
    }

    static async login(email: string, password: string): Promise<{ user: any, token: string }> {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        this.setToken(data.token);
        return data;
    }

    static isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
