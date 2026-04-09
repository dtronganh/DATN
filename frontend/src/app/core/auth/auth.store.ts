import { computed, Injectable, signal } from '@angular/core';
import { User } from '@core/models/user.model';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: User | null;
  rememberMe: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  private state = signal<AuthState>({
    accessToken: this.getStoredToken(),
    refreshToken: this.getStoredRefreshToken(),
    currentUser: this.getStoredUser(),
    rememberMe: this.getStoredRememberMe()
  });

  readonly accessToken = computed(() => this.state().accessToken);
  readonly refreshToken = computed(() => this.state().refreshToken);
  readonly currentUser = computed(() => this.state().currentUser);
  readonly isAuthenticated = computed(() => !!this.state().accessToken && !!this.state().currentUser);
  readonly isAdmin = computed(() => this.state().currentUser?.role === 'admin');
  readonly isUser = computed(() => this.state().currentUser?.role === 'user');

  private get storage(): Storage {
    return this.state().rememberMe ? localStorage : sessionStorage;
  }

  setTokens(accessToken: string, refreshToken: string, rememberMe?: boolean): void {
    const remember = rememberMe ?? this.state().rememberMe;

    this.state.update(state => ({
      ...state,
      accessToken,
      refreshToken,
      rememberMe: remember
    }));

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('accessToken', accessToken);
    storage.setItem('refreshToken', refreshToken);
    storage.setItem('rememberMe', JSON.stringify(remember));
  }

  login(accessToken: string, refreshToken: string, user: User, rememberMe: boolean = true): void {
    this.state.set({
      accessToken,
      refreshToken,
      currentUser: user,
      rememberMe
    });

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('accessToken', accessToken);
    storage.setItem('refreshToken', refreshToken);
    storage.setItem('currentUser', JSON.stringify(user));
    storage.setItem('rememberMe', JSON.stringify(rememberMe));
  }

  updateUser(user: User): void {
    this.state.update(state => ({
      ...state,
      currentUser: user
    }));
    this.storage.setItem('currentUser', JSON.stringify(user));
  }

  logout(): void {
    this.state.set({
      accessToken: null,
      refreshToken: null,
      currentUser: null,
      rememberMe: false
    });

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('rememberMe');
  }

  private getStoredRememberMe(): boolean {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('rememberMe') !== null) {
        return JSON.parse(localStorage.getItem('rememberMe')!);
      }
      if (sessionStorage.getItem('rememberMe') !== null) {
        return JSON.parse(sessionStorage.getItem('rememberMe')!);
      }
    }
    return true;
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    }
    return null;
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    }
    return null;
  }

  private getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      return userJson ? JSON.parse(userJson) : null;
    }
    return null;
  }
}
