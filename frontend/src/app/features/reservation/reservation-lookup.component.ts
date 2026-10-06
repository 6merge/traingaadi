import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { STATION_OPTIONS, normalizeBookingStatus, normalizeCoachType } from '../../core/models/railway.models';
import { ReservationService } from '../../core/services/reservation.service';

@Component({
  selector: 'app-reservation-lookup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Reservation lookup</p>
        <h1>Check PNR status</h1>
      </div>
    </section>

    <form class="lookup-form" [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>
        <span>PNR Number</span>
        <input type="text" formControlName="pnrNumber" placeholder="Enter PNR" />
      </label>

      <button type="submit" [disabled]="form.invalid || isSubmitting">
        {{ isSubmitting ? 'Checking...' : 'Check Status' }}
      </button>
    </form>

    <div class="result-box" *ngIf="result">
      <h3>Booking details</h3>

      <div class="summary-grid">
        <div><span>PNR</span><strong>{{ result.pnr ?? result.pnrNumber }}</strong></div>
        <div><span>Status</span><strong class="status-badge" [ngClass]="getStatusClass(result.status)">{{ getStatusLabel(result.status, result.waitlistPosition) }}</strong></div>
        <div><span>Train</span><strong>{{ result.trainId }}</strong></div>
        <div><span>Route</span><strong>{{ getStationCode(result.fromStationId) }} → {{ getStationCode(result.toStationId) }}</strong></div>
        <div><span>Date</span><strong>{{ formatDate(result.journeyDate) }}</strong></div>
        <div><span>Coach</span><strong>{{ getCoachLabel(result.coachType) }}</strong></div>
      </div>

      <p class="passenger-line"><strong>Passengers:</strong> {{ getPassengerSummary(result.passengers) }}</p>
    </div>

    <div class="error-box" *ngIf="errorMessage">{{ errorMessage }}</div>
  `,
  styles: [
    `
      :host { display: block; }
      .page-header { margin: 1rem 0 1.2rem; }
      .eyebrow { margin: 0; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #0f766e; }
      h1 { margin: 0.4rem 0 0; }
      .lookup-form { background: white; border: 1px solid #e2e8f0; border-radius: 18px; padding: 1.3rem; display: grid; gap: 1rem; }
      label { display: grid; gap: 0.35rem; color: #334155; }
      input { width: 100%; box-sizing: border-box; border: 1px solid #cbd5e1; padding: 0.85rem 1rem; border-radius: 12px; font: inherit; }
      button { border: none; background: #0f172a; color: white; border-radius: 12px; padding: 0.9rem 1.1rem; font-weight: 700; cursor: pointer; }
      button:disabled { opacity: 0.7; cursor: not-allowed; }
      .result-box, .error-box { margin-top: 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1rem 1.2rem; }
      .summary-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.8rem; margin: 1rem 0; }
      .summary-grid div { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.7rem 0.8rem; display: grid; gap: 0.2rem; }
      .summary-grid span { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; }
      .status-badge { display: inline-flex; align-items: center; justify-content: center; width: fit-content; padding: 0.32rem 0.7rem; border-radius: 999px; font-weight: 800; font-size: 0.78rem; }
      .status-badge.confirmed { background: #dcfce7; color: #166534; }
      .status-badge.waiting { background: #fef3c7; color: #92400e; }
      .status-badge.cancelled { background: #fee2e2; color: #991b1b; }
      .passenger-line { margin: 0.7rem 0 1rem; color: #334155; }
      .error-box { color: #b91c1c; background: #fef2f2; border-color: #fecaca; }
    `,
  ],
})
export class ReservationLookupComponent {
  readonly form!: FormGroup;

  result: any = null;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly reservationService: ReservationService,
  ) {
    this.form = this.fb.nonNullable.group({
      pnrNumber: ['', [Validators.required]],
    });

    this.form.valueChanges.subscribe(() => {
      const rawValue = this.form.getRawValue().pnrNumber ?? '';
      const trimmed = rawValue.toString().trim();

      this.isSubmitting = false;
      this.errorMessage = '';

      if (trimmed.length === 0) {
        this.result = null;
      }
    });
  }

  onSubmit(): void {
    const pnrNumber = (this.form.getRawValue().pnrNumber ?? '').toString().trim();

    if (!pnrNumber) {
      this.result = null;
      this.errorMessage = 'Please enter a PNR number.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.result = null;

    this.reservationService.getReservationByPnr(pnrNumber).subscribe({
      next: (reservation) => {
        if (!reservation || typeof reservation !== 'object') {
          this.result = null;
          this.errorMessage = 'No booking was found for this PNR.';
          this.isSubmitting = false;
          return;
        }

        this.result = reservation;
        this.isSubmitting = false;
      },
      error: (error: Error) => {
        this.isSubmitting = false;
        this.result = null;
        this.errorMessage = error.message || 'No booking was found for this PNR.';
      },
    });
  }

  getStationCode(stationId: number): string {
    return STATION_OPTIONS.find((station) => station.id === stationId)?.code ?? String(stationId ?? 'N/A');
  }

  getStatusLabel(value: number | string | null | undefined, waitlistPosition?: number | null): string {
    const status = normalizeBookingStatus(value as never);
    if (status === 'Waitlisted') {
      return waitlistPosition ? `Waiting #${waitlistPosition}` : 'Waiting';
    }

    return status;
  }

  getStatusClass(value: number | string | null | undefined): string {
    const status = normalizeBookingStatus(value as never);
    if (status === 'Waitlisted') {
      return 'waiting';
    }

    if (status === 'Cancelled') {
      return 'cancelled';
    }

    return 'confirmed';
  }

  getCoachLabel(value: number | string | null | undefined): string {
    return normalizeCoachType(value as never);
  }

  getPassengerSummary(passengers: Array<{ name?: string } | null> | undefined): string {
    if (!Array.isArray(passengers) || passengers.length === 0) {
      return 'Not available';
    }

    return passengers.map((passenger) => passenger?.name ?? 'Guest').join(', ');
  }

  formatDate(value: string | Date | null | undefined): string {
    if (!value) {
      return 'N/A';
    }

    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toISOString().slice(0, 10);
  }

  getJsonPreview(payload: unknown): string {
    return JSON.stringify(payload, null, 2);
  }
}
