import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, UserResponse } from '../models/railway.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'railway_token';
  private readonly userKey = 'railway_user';

  readonly currentUser = signal<UserResponse | null>(this.getStoredUser());

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<unknown>(`${environment.apiBaseUrl}/api/auth/login`, payload).pipe(
      map((response) => {
        const normalized = (response ?? {}) as Partial<LoginResponse>;
        const currentProfile = this.getStoredUser();
        const token = normalized.token ?? '';
        const safeResponse: LoginResponse = {
          token,
          userId: Number(normalized.userId ?? currentProfile?.id ?? 0),
          role: normalized.role ?? currentProfile?.role ?? 'Passenger',
          expiresIn: Number(normalized.expiresIn ?? 0),
        };

        if (token) {
          sessionStorage.setItem(this.tokenKey, token);
          sessionStorage.setItem(
            this.userKey,
            JSON.stringify({
              id: safeResponse.userId,
              name: currentProfile?.name ?? '',
              email: payload.email,
              phoneNumber: currentProfile?.phoneNumber ?? '',
              role: safeResponse.role,
            } satisfies UserResponse),
          );
          this.currentUser.set(this.getStoredUser());
        }

        return safeResponse;
      }),
      tap((response) => {
        if (!response.token) {
          this.currentUser.set(null);
        }
      }),
    );
  }

  updateProfile(profile: Partial<UserResponse>): UserResponse | null {
    const current = this.getStoredUser() ?? {
      id: 0,
      name: '',
      email: '',
      phoneNumber: '',
      role: this.getUserRole() ?? 'Passenger',
    };

    const nextUser = {
      ...current,
      ...profile,
      role: profile.role ?? current.role ?? this.getUserRole() ?? 'Passenger',
    } satisfies UserResponse;

    sessionStorage.setItem(this.userKey, JSON.stringify(nextUser));
    this.currentUser.set(nextUser);
    return nextUser;
  }

  register(payload: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${environment.apiBaseUrl}/api/auth/register`, payload).pipe(
      tap((user) => {
        sessionStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUser.set(user);
      }),
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'Administrator';
  }

  getUserRole(): string | null {
    return this.currentUser()?.role ?? this.decodeRoleFromToken();
  }

  getStoredUser(): UserResponse | null {
    const raw = sessionStorage.getItem(this.userKey);
    if (!raw) {
      const fallback = this.decodeUserFromToken();
      return fallback;
    }

    try {
      return JSON.parse(raw) as UserResponse;
    } catch {
      return null;
    }
  }

  private decodeUserFromToken(): UserResponse | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = this.decodeToken(token);
      const role = this.normalizeRole(
        payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? payload?.['role'] ?? null,
      );
      const userId = Number(
        payload?.['nameid'] ??
          payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
          0,
      );

      if (!userId || !role) {
        return null;
      }

      return {
        id: userId,
        name: '',
        email: '',
        phoneNumber: '',
        role,
      };
    } catch {
      return null;
    }
  }

  private decodeRoleFromToken(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = this.decodeToken(token);
      return this.normalizeRole(
        payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? payload?.['role'] ?? null,
      );
    } catch {
      return null;
    }
  }

  private decodeToken(token: string): Record<string, unknown> {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );

    return JSON.parse(json) as Record<string, unknown>;
  }

  private normalizeRole(role: unknown): string | null {
    if (Array.isArray(role)) {
      return role[0] ?? null;
    }

    return typeof role === 'string' ? role : null;
  }
}
