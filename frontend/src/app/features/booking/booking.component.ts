import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BookingRequest, CoachType, Gender, QuotaType, STATION_OPTIONS } from '../../core/models/railway.models';
import { ReservationService } from '../../core/services/reservation.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Reservation</p>
        <h1>Book a train</h1>
      </div>
    </section>

    <div class="error-box" *ngIf="errorMessage">{{ errorMessage }}</div>

    <form class="booking-form" [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="field-grid">
        <label>
          <span>Train</span>
          <select formControlName="trainId">
            <option [ngValue]="0" disabled>Select a train</option>
            <option *ngFor="let train of trainOptions" [ngValue]="train.id">
              {{ train.code }} · {{ train.name }}
            </option>
          </select>
        </label>

        <label>
          <span>From station</span>
          <select formControlName="fromStationId">
            <option [ngValue]="0" disabled>Select origin</option>
            <option *ngFor="let station of stationOptions" [ngValue]="station.id">
              {{ station.code }} · {{ station.name }}
            </option>
          </select>
        </label>

        <label>
          <span>To station</span>
          <select formControlName="toStationId">
            <option [ngValue]="0" disabled>Select destination</option>
            <option *ngFor="let station of stationOptions" [ngValue]="station.id">
              {{ station.code }} · {{ station.name }}
            </option>
          </select>
        </label>

        <label>
          <span>Journey date</span>
          <input type="date" formControlName="journeyDate" />
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
          <span>Quota</span>
          <select formControlName="quota">
            <option value="General">General</option>
            <option value="Ladies">Ladies</option>
          </select>
        </label>
      </div>

      <div class="passenger-section">
        <h3>Passenger details</h3>

        <div class="passenger-row" formArrayName="passengers">
          <div *ngFor="let passenger of passengers.controls; let i = index" [formGroupName]="i" class="passenger-card">
            <div class="passenger-header">
              <strong>Passenger {{ i + 1 }}</strong>
              <button type="button" class="remove-btn" *ngIf="i > 0" (click)="removePassenger(i)">Remove</button>
            </div>

            <div class="field-grid small-grid">
              <label>
                <span>Name</span>
                <input type="text" formControlName="name" />
              </label>

              <label>
                <span>Age</span>
                <input type="number" formControlName="age" min="1" />
              </label>

              <label>
                <span>Gender</span>
                <select formControlName="gender">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </label>

              <label class="full-width">
                <span>Address</span>
                <input type="text" formControlName="address" />
              </label>
            </div>
          </div>
        </div>

        <button type="button" class="secondary" (click)="addPassenger()">Add passenger</button>
      </div>

      <button type="submit" class="submit" [disabled]="form.invalid || isSubmitting">
        {{ isSubmitting ? 'Booking...' : 'Confirm Booking' }}
      </button>
    </form>
  `,
  styles: [
    `
      :host { display: block; }
      .page-header { margin: 1rem 0 1.2rem; }
      .eyebrow { margin: 0; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #0f766e; }
      h1 { margin: 0.4rem 0 0; }
      .booking-form { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 1.3rem; }
      .field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
      .small-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .full-width { grid-column: 1 / -1; }
      label { display: block; color: #334155; }
      label span { display: block; margin-bottom: 0.35rem; }
      input, select { width: 100%; box-sizing: border-box; padding: 0.85rem 1rem; border: 1px solid #cbd5e1; border-radius: 12px; font: inherit; }
      .passenger-section { margin-top: 1.5rem; }
      .passenger-row { display: grid; gap: 1rem; }
      .passenger-card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 1rem; background: #f8fafc; }
      .passenger-header { display: flex; justify-content: space-between; margin-bottom: 0.9rem; }
      .remove-btn, .secondary { border: 1px solid #cbd5e1; background: white; color: #0f172a; border-radius: 10px; padding: 0.6rem 0.8rem; cursor: pointer; }
      .submit { margin-top: 1.5rem; background: #0f172a; color: white; border: none; border-radius: 12px; padding: 0.95rem 1.2rem; font-weight: 700; cursor: pointer; width: 100%; }
      .submit:disabled { opacity: 0.7; cursor: not-allowed; }
      .error-box { color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 0.8rem 1rem; margin-bottom: 1rem; }
      @media (max-width: 760px) { .field-grid, .small-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class BookingComponent implements OnInit {
  readonly stationOptions = STATION_OPTIONS;
  readonly trainOptions = [
    { id: 1, code: '12001', name: 'Northern Express' },
    { id: 2, code: '12002', name: 'Southern Express' },
  ];

  isSubmitting = false;
  errorMessage = '';
  readonly form!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly reservationService: ReservationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.form = this.fb.nonNullable.group({
      trainId: [0, [Validators.required, Validators.min(1)]],
      fromStationId: [0, [Validators.required, Validators.min(1)]],
      toStationId: [0, [Validators.required, Validators.min(1)]],
      journeyDate: [this.todayString(), [Validators.required]],
      coachType: ['General', Validators.required],
      quota: ['General', Validators.required],
      passengers: this.fb.nonNullable.array([this.createPassenger()]),
    });
  }

  get passengers(): FormArray {
    return this.form.get('passengers') as FormArray;
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const trainId = Number(params.get('trainId') ?? 0);
      const fromStationId = Number(params.get('fromStationId') ?? 0);
      const toStationId = Number(params.get('toStationId') ?? 0);
      const coachType = params.get('coachType') ?? 'General';
      const quota = params.get('quota') ?? 'General';
      const journeyDate = params.get('journeyDate') ?? this.todayString();

      if (trainId) {
        this.form.patchValue({ trainId, fromStationId, toStationId, journeyDate, coachType, quota });
      }
    });
  }

  addPassenger(): void {
    this.passengers.push(this.createPassenger());
  }

  removePassenger(index: number): void {
    if (this.passengers.length > 1) {
      this.passengers.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const coachType = (this.form.get('coachType')?.value ?? 'General') as CoachType;
    const quota = (this.form.get('quota')?.value ?? 'General') as QuotaType;

    const payload: BookingRequest = {
      trainId: Number(this.form.get('trainId')?.value ?? 0),
      fromStationId: Number(this.form.get('fromStationId')?.value ?? 0),
      toStationId: Number(this.form.get('toStationId')?.value ?? 0),
      journeyDate: this.form.get('journeyDate')?.value ?? this.todayString(),
      coachType: this.toEnumNumber(coachType, {
        General: 0,
        Sleeper: 1,
        AC3Tier: 2,
        AC2Tier: 3,
        AC1Tier: 4,
      }),
      quota: this.toEnumNumber(quota, {
        General: 0,
        Ladies: 1,
      }),
      passengers: this.passengers.value.map((passenger: Record<string, unknown>) => ({
        name: String(passenger?.['name'] ?? ''),
        age: Number(passenger?.['age'] ?? 0),
        gender: this.toEnumNumber((passenger?.['gender'] ?? 'Male') as Gender, {
          Male: 0,
          Female: 1,
        }),
        address: String(passenger?.['address'] ?? 'N/A'),
      })),
    };

    this.reservationService.createReservation(payload).subscribe({
      next: (result) => {
        const pnr = result.pnr ?? result.pnrNumber ?? '';
        if (pnr) {
          this.reservationService.saveBookingSummary({
            pnr,
            trainId: payload.trainId,
            fromStationId: payload.fromStationId,
            toStationId: payload.toStationId,
            coachType: payload.coachType,
            status: result.status ?? 'Confirmed',
            journeyDate: payload.journeyDate,
            createdAt: new Date().toISOString(),
          });
        }

        this.router.navigate(['/reservation/confirmation'], {
          queryParams: { pnr },
        });
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

  private createPassenger() {
    return this.fb.nonNullable.group({
      name: ['', Validators.required],
      age: [18, [Validators.required, Validators.min(1)]],
      gender: ['Male', Validators.required],
      address: ['N/A', Validators.required],
    });
  }

  private toEnumNumber<T extends string | number>(value: T, map: Record<string, number>): number {
    if (typeof value === 'number') {
      return value;
    }

    const key = String(value);
    const mapped = map[key];
    if (mapped !== undefined) {
      return mapped;
    }

    const numericValue = Number(key);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  private todayString(): string {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 10);
  }
}
