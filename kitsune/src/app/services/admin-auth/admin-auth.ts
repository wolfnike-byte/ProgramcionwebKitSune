import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../supabase/supabaseService';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private readonly authenticatedSubject = new BehaviorSubject<boolean>(false);
  readonly authenticated$ = this.authenticatedSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.refreshSession();
    this.supabaseService.onAuthStateChange((_event, session) => {
      this.authenticatedSubject.next(Boolean(session));
    });
  }

  get isAuthenticated(): boolean {
    return this.authenticatedSubject.value;
  }

  async refreshSession(): Promise<boolean> {
    const { data } = await this.supabaseService.getSession();
    const isAuthenticated = Boolean(data.session);
    this.authenticatedSubject.next(isAuthenticated);
    return isAuthenticated;
  }

  async login(email: string, password: string): Promise<void> {
    await this.supabaseService.signInAdmin(email, password);
  }

  async logout() {
    await this.supabaseService.signOutAdmin();
    this.authenticatedSubject.next(false);
  }
}
