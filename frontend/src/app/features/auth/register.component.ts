import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-shell">
      <div class="auth-card">
        <div class="header-row">
          <div>
            <p class="eyebrow">New account</p>
            <h1>Register</h1>
          </div>
          <a routerLink="/login">Already have an account?</a>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <label>
            <span>Name</span>
            <input type="text" formControlName="name" />
          </label>

          <label>
            <span>Email</span>
            <input type="email" formControlName="email" />
          </label>

          <label>
            <span>Phone number</span>
            <input type="tel" formControlName="phoneNumber" />
          </label>

          <label>
            <span>Password</span>
            <input type="password" formControlName="password" />
          </label>

          <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button type="submit" [disabled]="form.invalid || isSubmitting">
            {{ isSubmitting ? 'Creating account...' : 'Register' }}
          </button>
        </form>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .auth-shell {
        display: grid;
        place-items: center;
        min-height: 70vh;
      }

      .auth-card {
        width: min(100%, 480px);
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 24px;
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
        padding: 2rem;
      }

      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.2rem;
      }

      .eyebrow {
        margin: 0;
        color: #0f766e;
        font-size: 0.8rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-weight: 700;
      }

      h1 {
        margin: 0.3rem 0 0;
      }

      a {
        color: #0f172a;
        text-decoration: none;
        font-weight: 600;
      }

      form {
        display: grid;
        gap: 1rem;
      }

      label {
        display: block;
      }

      label span {
        display: block;
        margin-bottom: 0.35rem;
        color: #334155;
      }

      input {
        width: 100%;
        box-sizing: border-box;
        padding: 0.85rem 1rem;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        font: inherit;
      }

      .error {
        color: #b91c1c;
        background: #fee2e2;
        border-radius: 10px;
        padding: 0.7rem 0.9rem;
      }

      button {
        width: 100%;
        border: none;
        background: #0f172a;
        padding: 0.9rem 1.2rem;
        border-radius: 12px;
        color: white;
        font-weight: 700;
        cursor: pointer;
      }

      button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    `,
  ],
})
export class RegisterComponent {
  readonly form!: FormGroup;

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error: Error) => {
        this.isSubmitting = false;
        this.errorMessage = error.message;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
