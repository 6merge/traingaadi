import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Admin area</p>
        <h1>Train and fare management</h1>
      </div>
    </section>

    <div class="panel-grid">
      <form class="panel" [formGroup]="form" (ngSubmit)="onSubmit()">
        <h3>Add fare</h3>

        <label>
          <span>Train ID</span>
          <input type="number" formControlName="trainId" />
        </label>

        <label>
          <span>From station ID</span>
          <input type="number" formControlName="fromStationId" />
        </label>

        <label>
          <span>To station ID</span>
          <input type="number" formControlName="toStationId" />
        </label>

        <label>
          <span>Coach type</span>
          <select formControlName="coachType">
            <option value="General">General</option>
            <option value="Sleeper">Sleeper</option>
            <option value="AC3Tier">AC3Tier</option>
            <option value="AC2Tier">AC2Tier</option>
            <option value="AC1Tier">AC1Tier</option>
          </select>
        </label>

        <label>
          <span>Fare amount</span>
          <input type="number" formControlName="amount" min="0" />
        </label>

        <div class="error-box" *ngIf="errorMessage">{{ errorMessage }}</div>
        <div class="success-box" *ngIf="successMessage">{{ successMessage }}</div>

        <button type="submit" [disabled]="form.invalid || isSubmitting">
          {{ isSubmitting ? 'Saving...' : 'Save fare' }}
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .page-header { margin: 1rem 0 1.2rem; }
      .eyebrow { margin: 0; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #0f766e; }
      h1 { margin: 0.4rem 0 0; }
      .panel-grid { display: grid; grid-template-columns: minmax(0, 520px); }
      .panel { background: white; border: 1px solid #e2e8f0; border-radius: 18px; padding: 1.2rem; display: grid; gap: 0.95rem; }
      label { display: grid; gap: 0.35rem; color: #334155; }
      input, select { width: 100%; box-sizing: border-box; padding: 0.85rem 1rem; border-radius: 12px; border: 1px solid #cbd5e1; font: inherit; }
      button { border: none; background: #0f172a; color: white; border-radius: 12px; padding: 0.9rem 1.1rem; font-weight: 700; cursor: pointer; }
      button:disabled { opacity: 0.7; cursor: not-allowed; }
      .error-box, .success-box { border-radius: 12px; padding: 0.75rem 0.9rem; }
      .error-box { color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; }
      .success-box { color: #166534; background: #dcfce7; border: 1px solid #bbf7d0; }
    `,
  ],
})
export class AdminDashboardComponent {
  readonly form!: FormGroup;

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminService: AdminService,
  ) {
    this.form = this.fb.nonNullable.group({
      trainId: [0, [Validators.required, Validators.min(1)]],
      fromStationId: [0, [Validators.required, Validators.min(1)]],
      toStationId: [0, [Validators.required, Validators.min(1)]],
      coachType: ['General', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = this.form.getRawValue();
    this.adminService
      .createFare({
        trainId: Number(payload.trainId),
        fromStationId: Number(payload.fromStationId),
        toStationId: Number(payload.toStationId),
        coachType: payload.coachType as 'General' | 'Sleeper' | 'AC3Tier' | 'AC2Tier' | 'AC1Tier',
        amount: Number(payload.amount),
      })
      .subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Fare saved successfully.';
        this.form.reset({
          trainId: 0,
          fromStationId: 0,
          toStationId: 0,
          coachType: 'General',
          amount: 0,
        });
      },
      error: (error: Error) => {
        this.isSubmitting = false;
        this.errorMessage = error.message;
      },
    });
  }
}
