import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { STATION_OPTIONS, StoredBookingSummary, normalizeBookingStatus, normalizeCoachType } from '../../core/models/railway.models';
import { AuthService } from '../../core/services/auth.service';
import { ReservationService } from '../../core/services/reservation.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-shell">
      <div class="card user-card">
        <p class="eyebrow">Account</p>
        <h1>My Profile</h1>

        <div class="status-pill" *ngIf="user() as currentUser; else signedOut">
          <span class="status-dot"></span>
          Hello, {{ currentUser.name || currentUser.email || 'Traveller' }}
        </div>

        <ng-template #signedOut>
          <div class="status-pill signed-out">
            <span class="status-dot"></span>
            Not signed in
          </div>
        </ng-template>

        <form class="profile-form" [formGroup]="profileForm" (ngSubmit)="saveProfile()">
          <label>
            <span>Display name</span>
            <input formControlName="name" placeholder="Enter your name" />
          </label>

          <label>
            <span>Email</span>
            <input formControlName="email" type="email" placeholder="name@example.com" />
          </label>

          <label>
            <span>Phone</span>
            <input formControlName="phoneNumber" placeholder="Phone number" />
          </label>

          <button type="submit" class="primary-btn">Save profile</button>
        </form>

        <button type="button" class="logout-btn" (click)="logout()">Logout</button>
      </div>

      <div class="card bookings-card">
        <div class="booking-header">
          <div>
            <p class="eyebrow">Bookings</p>
            <h2>Current reservations</h2>
          </div>
        </div>

        <div class="empty-state" *ngIf="bookings().length === 0">
          <p>No bookings yet.</p>
          <small>Bookings booked from this browser will appear here. If you already have PNRs from the backend, you can load them below.</small>
        </div>

        <form class="lookup-form" [formGroup]="bookingForm" (ngSubmit)="lookupBooking()">
          <label>
            <span>Load booking by PNR</span>
            <input formControlName="pnr" placeholder="Enter PNR" />
          </label>
          <button type="submit" class="secondary-btn" [disabled]="bookingForm.invalid || isLookingUp">
            {{ isLookingUp ? 'Checking...' : 'Load booking' }}
          </button>
        </form>

        <div class="error-box" *ngIf="errorMessage">{{ errorMessage }}</div>

        <div class="bookings-layout" *ngIf="bookings().length > 0">
          <div class="booking-list">
            <article
              class="booking-item"
              *ngFor="let booking of bookings()"
              [class.selected]="selectedBooking?.pnr === booking.pnr"
              (click)="selectBooking(booking)"
            >
              <div class="pnr-row">
                <span class="pnr-label">PNR</span>
                <strong>{{ booking.pnr }}</strong>
              </div>
              <div class="booking-meta">
                <span>{{ getStationCode(booking.fromStationId) }} → {{ getStationCode(booking.toStationId) }}</span>
                <span>{{ formatDate(booking.journeyDate) }}</span>
              </div>
              <div class="booking-meta secondary">
                <span>{{ getCoachLabel(booking.coachType) }}</span>
                <span class="status-chip" [ngClass]="getStatusClass(booking.status)">{{ getStatusLabel(booking.status) }}</span>
              </div>
            </article>
          </div>

          <aside class="detail-panel" *ngIf="selectedBooking">
            <h3>Booking details</h3>
            <div class="detail-grid">
              <div><span>PNR</span><strong>{{ selectedBooking.pnr }}</strong></div>
              <div><span>Status</span><strong class="status-chip" [ngClass]="getStatusClass(selectedBooking.status)">{{ getStatusLabel(selectedBooking.status) }}</strong></div>
              <div><span>Route</span><strong>{{ getStationCode(selectedBooking.fromStationId) }} → {{ getStationCode(selectedBooking.toStationId) }}</strong></div>
              <div><span>Date</span><strong>{{ formatDate(selectedBooking.journeyDate) }}</strong></div>
              <div><span>Coach</span><strong>{{ getCoachLabel(selectedBooking.coachType) }}</strong></div>
              <div><span>Booking time</span><strong>{{ formatDateTime(selectedBooking.createdAt) }}</strong></div>
            </div>

            <div class="passenger-box" *ngIf="selectedPassengers().length > 0">
              <h4>Passengers</h4>
              <ul>
                <li *ngFor="let passenger of selectedPassengers()">{{ passenger.name }}</li>
              </ul>
            </div>

            <button type="button" class="cancel-btn" (click)="cancelSelectedBooking()">Cancel ticket</button>
          </aside>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .page-shell { display: grid; grid-template-columns: minmax(0, 420px) minmax(0, 1fr); gap: 1.5rem; padding-top: 1rem; }
      .card { background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 1.5rem; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04); }
      .eyebrow { margin: 0; color: #0f766e; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 800; }
      h1, h2 { margin: 0.55rem 0 1rem; }
      .status-pill { display: inline-flex; align-items: center; gap: 0.5rem; background: #ecfdf5; border: 1px solid #bbf7d0; color: #166534; border-radius: 999px; padding: 0.5rem 0.8rem; font-weight: 700; }
      .status-pill.signed-out { background: #f8fafc; border-color: #e2e8f0; color: #475569; }
      .status-dot { width: 0.6rem; height: 0.6rem; border-radius: 50%; background: currentColor; display: inline-block; }
      .profile-form, .lookup-form { display: grid; gap: 0.8rem; margin-top: 1.2rem; }
      label { display: block; color: #334155; }
      label span { display: block; margin-bottom: 0.35rem; }
      input { width: 100%; box-sizing: border-box; padding: 0.8rem 0.9rem; border: 1px solid #cbd5e1; border-radius: 12px; font: inherit; }
      .primary-btn, .secondary-btn, .logout-btn { width: 100%; border: none; border-radius: 12px; padding: 0.85rem 1rem; font-weight: 800; cursor: pointer; }
      .primary-btn { background: #0f172a; color: white; }
      .secondary-btn { background: #dbeafe; color: #1d4ed8; }
      .logout-btn { margin-top: 1.2rem; background: #0f172a; color: white; }
      .error-box { margin-top: 0.8rem; background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 12px; padding: 0.8rem 0.9rem; }
      .booking-header { display: flex; justify-content: space-between; align-items: center; }
      .empty-state { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 16px; padding: 1.2rem; color: #475569; }
      .empty-state p { margin: 0 0 0.35rem; font-weight: 700; }
      .bookings-layout { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 1rem; align-items: start; }
      .booking-list { display: grid; gap: 0.8rem; }
      .booking-item { border: 1px solid #e2e8f0; border-radius: 18px; padding: 1rem; background: linear-gradient(180deg, #ffffff, #f8fafc); cursor: pointer; }
      .booking-item.selected { border-color: #0f766e; box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.08); }
      .pnr-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 0.8rem; }
      .pnr-label { color: #64748b; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; }
      .booking-meta { display: flex; flex-wrap: wrap; gap: 0.6rem 1rem; color: #334155; font-weight: 600; }
      .booking-meta.secondary { color: #0f766e; font-size: 0.88rem; }
      .status-chip { display: inline-flex; align-items: center; border-radius: 999px; padding: 0.3rem 0.6rem; font-size: 0.75rem; font-weight: 800; }
      .status-chip.confirmed { background: #dcfce7; color: #166534; }
      .status-chip.waiting { background: #fef3c7; color: #92400e; }
      .status-chip.cancelled { background: #fee2e2; color: #991b1b; }
      .detail-panel { position: sticky; top: 1rem; border: 1px solid #e2e8f0; border-radius: 18px; padding: 1rem; background: #f8fafc; }
      .detail-panel h3 { margin-top: 0; }
      .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem 1rem; }
      .detail-grid div { display: grid; gap: 0.12rem; }
      .detail-grid span { color: #64748b; font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.06em; }
      .passenger-box { margin-top: 1rem; border-top: 1px solid #e2e8f0; padding-top: 1rem; }
      .passenger-box h4 { margin: 0 0 0.5rem; }
      .passenger-box ul { margin: 0; padding-left: 1.2rem; }
      .passenger-box li { margin-bottom: 0.25rem; }
      .cancel-btn { margin-top: 1rem; width: 100%; border: none; border-radius: 12px; padding: 0.8rem 1rem; background: #7f1d1d; color: white; font-weight: 800; cursor: pointer; }
      @media (max-width: 900px) { .page-shell { grid-template-columns: 1fr; } .bookings-layout { grid-template-columns: 1fr; } .detail-panel { position: static; } .detail-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly reservationService = inject(ReservationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly user = this.authService.currentUser;
  readonly bookings = signal<StoredBookingSummary[]>(this.reservationService.getStoredBookings());
  readonly selectedPassengers = signal<{ name: string }[]>([]);
  selectedBooking: StoredBookingSummary | null = null;
  readonly profileForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
  });
  readonly bookingForm = this.fb.nonNullable.group({
    pnr: ['', Validators.required],
  });

  isLookingUp = false;
  errorMessage = '';

  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (currentUser?.id) {
        this.loadMyBookings();
      }
      this.syncProfileForm();
    });
  }

  private loadMyBookings(): void {
    this.reservationService.getMyBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        if (bookings.length > 0 && !this.selectedBooking) {
          this.selectedBooking = bookings[0];
          this.selectBooking(bookings[0]);
        }
      },
      error: () => {
        this.bookings.set(this.reservationService.getStoredBookings());
      },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const values = this.profileForm.getRawValue();
    this.authService.updateProfile({
      name: values.name,
      email: values.email,
      phoneNumber: values.phoneNumber,
    });
  }

  lookupBooking(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isLookingUp = true;
    this.errorMessage = '';

    const pnr = this.bookingForm.getRawValue().pnr.trim();
    this.reservationService.getReservationByPnr(pnr).subscribe({
      next: (details) => {
        this.reservationService.saveBookingFromDetails(details);
        this.bookings.set(this.reservationService.getStoredBookings());
        this.bookingForm.reset();
        this.isLookingUp = false;
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.isLookingUp = false;
      },
    });
  }

  selectBooking(booking: StoredBookingSummary): void {
    this.selectedBooking = booking;
    this.selectedPassengers.set([]);

    this.reservationService.getReservationByPnr(booking.pnr).subscribe({
      next: (details) => {
        this.selectedPassengers.set((details.passengers ?? []).map((passenger) => ({ name: passenger.name })));
      },
      error: () => {
        this.selectedPassengers.set([]);
      },
    });
  }

  cancelSelectedBooking(): void {
    if (!this.selectedBooking) {
      return;
    }

    this.reservationService.cancelReservation(this.selectedBooking.pnr).subscribe({
      next: (result) => {
        const nextStatus = normalizeBookingStatus(result.status ?? this.selectedBooking?.status ?? 'Confirmed');
        const updatedBooking = this.bookings().map((booking) =>
          booking.pnr === this.selectedBooking?.pnr ? { ...booking, status: nextStatus } : booking,
        );
        this.bookings.set(updatedBooking);
        this.selectedBooking = updatedBooking.find((booking) => booking.pnr === this.selectedBooking?.pnr) ?? null;
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'Cancel request failed. Please check the backend and try again.';
      },
    });
  }

  getCoachLabel(value: string | number): string {
    return normalizeCoachType(value);
  }

  getStationCode(stationId: number): string {
    return STATION_OPTIONS.find((station) => station.id === stationId)?.code ?? `#${stationId}`;
  }

  getStatusLabel(status: string | number, waitlistPosition?: number | null): string {
    const normalized = normalizeBookingStatus(status);

    if (normalized === 'Waitlisted') {
      return waitlistPosition ? `Waiting #${waitlistPosition}` : 'Waiting';
    }

    return normalized === 'Cancelled' ? 'Cancelled' : 'Confirmed';
  }

  getStatusClass(status: string | number): string {
    const normalized = normalizeBookingStatus(status);
    return normalized === 'Waitlisted' ? 'waiting' : normalized === 'Cancelled' ? 'cancelled' : 'confirmed';
  }

  formatDate(value: string): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatDateTime(value: string): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private syncProfileForm(): void {
    const account = this.user();
    this.profileForm.patchValue({
      name: account?.name ?? '',
      email: account?.email ?? '',
      phoneNumber: account?.phoneNumber ?? '',
    });
  }
}
