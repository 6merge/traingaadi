import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());
  readonly isAdmin = computed(() => this.authService.isAdmin());

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
