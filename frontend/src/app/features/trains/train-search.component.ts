import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CoachType, Fare, RouteStop, STATION_OPTIONS, Train } from '../../core/models/railway.models';
import { ReservationService } from '../../core/services/reservation.service';
import { TrainService } from '../../core/services/train.service';

@Component({
  selector: 'app-train-search',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Search results</p>
        <h1>Available trains</h1>
      </div>
    </section>

    <div class="search-summary" *ngIf="fromStationId && toStationId">
      <strong>{{ fromStationCode }} · {{ fromStationName }}</strong>
      <span class="divider">→</span>
      <strong>{{ toStationCode }} · {{ toStationName }}</strong>
      <span class="divider">·</span>
      <strong>{{ journeyDate }}</strong>
    </div>

    <div class="loading" *ngIf="isLoading">Loading trains...</div>
    <div class="error-box" *ngIf="errorMessage">{{ errorMessage }}</div>

    <div class="empty-state" *ngIf="!isLoading && !errorMessage && trains.length === 0">
      <h3>No trains found</h3>
      <p>Try different station codes or use the booking form to reserve a route directly.</p>
      <a class="inline-link" routerLink="/booking">Book a train</a>
    </div>

    <div class="train-grid" *ngIf="!isLoading && trains.length > 0">
      <article class="train-card" *ngFor="let train of trains">
        <div class="card-topline">
          <span class="chip">{{ train.trainNumber }}</span>
          <span class="status">Available</span>
        </div>

        <h3>{{ train.name }}</h3>

        <div class="meta-row">
          <span>Train ID: {{ train.id }}</span>
        </div>

        <div class="availability-panel">
          <label>
            <span>Travel date</span>
            <input
              type="date"
              [value]="selectedDateByTrain[train.id] ?? journeyDate"
              (change)="selectedDateByTrain[train.id] = $any($event.target).value || journeyDate"
            />
          </label>

          <label>
            <span>Coach</span>
            <select [value]="selectedCoachByTrain[train.id] ?? 'General'" (change)="selectedCoachByTrain[train.id] = $any($event.target).value">
              <option value="General">General</option>
              <option value="Sleeper">Sleeper</option>
              <option value="AC3Tier">AC3Tier</option>
              <option value="AC2Tier">AC2Tier</option>
              <option value="AC1Tier">AC1Tier</option>
            </select>
          </label>
        </div>

        <button type="button" class="mini-btn" (click)="checkAvailability(train.id)">Check availability</button>

        <div class="availability-result" *ngIf="availabilityByTrain.has(train.id)">
          <div class="result-main">
            <strong>{{ getCoachLabel(selectedCoachByTrain[train.id] ?? 'General') }}</strong>
            <span>{{ availabilityByTrain.get(train.id)?.availableSeats ?? 0 }} seats</span>
          </div>
          <div class="result-meta">
            <span>{{ availabilityByTrain.get(train.id)?.journeyDate }}</span>
            <span>₹{{ fareByTrain.get(train.id)?.amount ?? 0 }}</span>
          </div>
        </div>

        <div class="api-response-frame" *ngIf="availabilityByTrain.has(train.id)">
          <div class="frame-header">
            <strong>Availability</strong>
            <span>{{ getCoachLabel(selectedCoachByTrain[train.id] ?? 'General') }}</span>
          </div>

          <div class="metrics-grid">
            <div>
              <span>Seats</span>
              <strong>{{ availabilityByTrain.get(train.id)?.availableSeats ?? 0 }}</strong>
            </div>
            <div>
              <span>Fare</span>
              <strong>₹{{ fareByTrain.get(train.id)?.amount ?? 0 }}</strong>
            </div>
            <div>
              <span>Date</span>
              <strong>{{ availabilityByTrain.get(train.id)?.journeyDate }}</strong>
            </div>
            <div>
              <span>Route</span>
              <strong>{{ getRouteSummary(train.id) }}</strong>
            </div>
          </div>
        </div>

        <div class="route-box" *ngIf="routeByTrain.has(train.id)">
          <h4>Route stops</h4>
          <ul>
            <li *ngFor="let stop of routeByTrain.get(train.id) ?? []">
              {{ stop.stationCode }} · {{ stop.stationName }}
            </li>
          </ul>
        </div>

        <div class="actions">
          <a [routerLink]="['/trains', train.id]" [queryParams]="{ fromStationId, toStationId, journeyDate }">View details</a>
          <a
            class="primary"
            [routerLink]="['/booking']"
            [queryParams]="{
              trainId: train.id,
              fromStationId,
              toStationId,
              journeyDate: selectedDateByTrain[train.id] ?? journeyDate,
              coachType: selectedCoachByTrain[train.id] ?? 'General',
              quota: 'General'
            }"
          >Continue booking</a>
        </div>
      </article>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .page-header {
        margin: 1rem 0 1.4rem;
      }

      .eyebrow {
        margin: 0;
        color: #0f766e;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-size: 0.72rem;
      }

      h1 {
        margin: 0.4rem 0 0;
      }

      .search-summary {
        display: inline-flex;
        align-items: center;
        gap: 0.85rem;
        background: linear-gradient(90deg, #ecfeff, #f8fafc);
        border: 1px solid #a5f3fc;
        color: #155e75;
        border-radius: 999px;
        padding: 0.8rem 1rem;
        margin-bottom: 1rem;
        box-shadow: 0 12px 22px rgba(14, 116, 144, 0.08);
      }

      .divider {
        color: #475569;
        font-weight: 800;
      }

      .train-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1rem;
      }

      .train-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 1.2rem;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
      }

      .card-topline {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chip {
        display: inline-block;
        background: #dbeafe;
        color: #1d4ed8;
        border-radius: 999px;
        padding: 0.35rem 0.7rem;
        font-size: 0.8rem;
        font-weight: 700;
      }

      .status {
        color: #0f766e;
        font-weight: 700;
        font-size: 0.8rem;
      }

      h3 {
        margin: 1rem 0 0.7rem;
      }

      .meta-row {
        color: #475569;
        margin-bottom: 1rem;
      }

      .availability-panel {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.7rem;
        align-items: end;
        margin: 1rem 0;
      }

      .availability-panel label {
        display: block;
      }

      .availability-panel span {
        display: block;
        margin-bottom: 0.35rem;
        color: #475569;
        font-size: 0.8rem;
      }

      .availability-panel input,
      .availability-panel select {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        padding: 0.7rem 0.8rem;
        font: inherit;
      }

      .mini-btn {
        width: 100%;
        border: none;
        background: #dbeafe;
        color: #1d4ed8;
        border-radius: 10px;
        padding: 0.72rem 0.9rem;
        font-weight: 700;
        cursor: pointer;
        margin-bottom: 0.8rem;
      }

      .availability-result {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        background: #ecfeff;
        border: 1px solid #a5f3fc;
        border-radius: 12px;
        padding: 0.7rem 0.8rem;
        color: #155e75;
        margin-bottom: 1rem;
        font-size: 0.84rem;
      }

      .result-main,
      .result-meta {
        display: grid;
        gap: 0.25rem;
      }

      .api-response-frame {
        border: 1px solid #dbeafe;
        background: #f8fbff;
        border-radius: 14px;
        padding: 0.9rem;
        margin-bottom: 1rem;
      }

      .frame-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.7rem;
        color: #0f172a;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.7rem;
      }

      .metrics-grid div {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 0.55rem 0.7rem;
        display: grid;
        gap: 0.2rem;
      }

      .metrics-grid span {
        color: #64748b;
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .route-box {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 0.8rem 0.9rem;
        background: #f8fafc;
        margin-bottom: 1rem;
      }

      .route-box h4 {
        margin: 0 0 0.6rem;
      }

      .route-box ul {
        margin: 0;
        padding-left: 1.1rem;
        display: grid;
        gap: 0.3rem;
        color: #475569;
      }

      .actions {
        display: flex;
        gap: 0.7rem;
        flex-wrap: wrap;
      }

      .actions a {
        text-decoration: none;
        border-radius: 10px;
        padding: 0.72rem 1rem;
        color: #0f172a;
        border: 1px solid #cbd5e1;
        font-weight: 600;
      }

      .actions a.primary {
        background: #0f172a;
        border-color: #0f172a;
        color: white;
      }

      .loading,
      .error-box,
      .empty-state {
        background: rgba(255, 255, 255, 0.7);
        border-radius: 16px;
        padding: 1rem 1.2rem;
        border: 1px solid #e2e8f0;
      }

      .inline-link {
        display: inline-block;
        margin-top: 0.75rem;
        color: #0f172a;
        font-weight: 700;
      }

      .error-box {
        color: #b91c1c;
        background: #fef2f2;
        border-color: #fecaca;
      }
    `,
  ],
})
export class TrainSearchComponent implements OnInit {
  trains: Train[] = [];
  fromStationId = 0;
  toStationId = 0;
  fromStationCode = 'ALP';
  toStationCode = 'BRV';
  fromStationName = 'Alpha Junction';
  toStationName = 'Bravo Central';
  journeyDate = this.todayString();
  isLoading = false;
  errorMessage = '';
  selectedCoachByTrain: Record<number, CoachType> = {};
  selectedDateByTrain: Record<number, string> = {};
  availabilityByTrain = new Map<number, { availableSeats: number; coachType: CoachType; journeyDate: string }>();
  fareByTrain = new Map<number, { amount: number; coachType: CoachType }>();
  routeByTrain = new Map<number, RouteStop[]>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly trainService: TrainService,
    private readonly reservationService: ReservationService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const from = Number(params.get('fromStationId') ?? 0);
      const to = Number(params.get('toStationId') ?? 0);
      const fromCode = params.get('fromStationCode') ?? this.fromStationCode;
      const toCode = params.get('toStationCode') ?? this.toStationCode;
      const journeyDate = params.get('journeyDate') ?? this.todayString();

      const fromStation = STATION_OPTIONS.find((station) => station.id === from) ?? STATION_OPTIONS.find((station) => station.code === fromCode);
      const toStation = STATION_OPTIONS.find((station) => station.id === to) ?? STATION_OPTIONS.find((station) => station.code === toCode);

      if (!from || !to || from === to) {
        this.errorMessage = 'Please choose two different stations before searching.';
        this.isLoading = false;
        this.trains = [];
        return;
      }

      this.fromStationId = from;
      this.toStationId = to;
      this.fromStationCode = fromStation?.code ?? fromCode;
      this.toStationCode = toStation?.code ?? toCode;
      this.fromStationName = fromStation?.name ?? 'Origin';
      this.toStationName = toStation?.name ?? 'Destination';
      this.journeyDate = journeyDate;
      this.loadTrains(from, to);
    });
  }

  checkAvailability(trainId: number): void {
    const coachType = (this.selectedCoachByTrain[trainId] ?? 'General') as CoachType;
    const selectedDate = this.selectedDateByTrain[trainId] ?? this.journeyDate;

    forkJoin({
      availability: this.reservationService.getAvailability(trainId, this.fromStationId, this.toStationId, selectedDate, coachType),
      route: this.trainService.getRoute(trainId),
      fare: this.trainService.getFare(trainId, this.fromStationId, this.toStationId, coachType),
    }).subscribe({
      next: ({ availability, route, fare }) => {
        this.availabilityByTrain.set(trainId, {
          availableSeats: availability.availableSeats,
          coachType,
          journeyDate: selectedDate,
        });
        this.routeByTrain.set(trainId, route);
        this.fareByTrain.set(trainId, { amount: fare.amount ?? 0, coachType });
      },
      error: () => {
        this.availabilityByTrain.set(trainId, {
          availableSeats: 0,
          coachType,
          journeyDate: selectedDate,
        });
        this.routeByTrain.delete(trainId);
        this.fareByTrain.delete(trainId);
      },
    });
  }

  getCoachLabel(coachType: CoachType): string {
    if (typeof coachType === 'number') {
      const labels = ['General', 'Sleeper', 'AC3Tier', 'AC2Tier', 'AC1Tier'];
      return labels[coachType] ?? String(coachType);
    }

    return String(coachType ?? 'General');
  }

  getRouteSummary(trainId: number): string {
    const route = this.routeByTrain.get(trainId) ?? [];
    if (route.length === 0) {
      return 'Not available';
    }

    return route.map((stop) => `${stop.stationCode}`).join(' → ');
  }

  getAvailabilityJson(trainId: number): string {
    const availability = this.availabilityByTrain.get(trainId);
    const fare = this.fareByTrain.get(trainId);
    const route = this.routeByTrain.get(trainId) ?? [];

    const payload = {
      trainId,
      fromStationId: this.fromStationId,
      toStationId: this.toStationId,
      journeyDate: availability?.journeyDate ?? this.journeyDate,
      coachType: availability?.coachType ?? (this.selectedCoachByTrain[trainId] ?? 'General'),
      availableSeats: availability?.availableSeats ?? 0,
      fare: fare?.amount ?? 0,
      route: route.map((stop) => ({
        stationId: stop.stationId,
        stationCode: stop.stationCode,
        stationName: stop.stationName,
        stopOrder: stop.stopOrder,
      })),
    };

    return JSON.stringify(payload, null, 2);
  }

  private loadTrains(fromStationId: number, toStationId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.availabilityByTrain.clear();
    this.routeByTrain.clear();
    this.fareByTrain.clear();

    this.trainService.searchTrains(fromStationId, toStationId).subscribe({
      next: (trains) => {
        this.trains = Array.isArray(trains) ? trains : [];
        this.isLoading = false;

        this.trains.forEach((train) => {
          this.selectedCoachByTrain[train.id] = this.selectedCoachByTrain[train.id] ?? 'General';
          this.selectedDateByTrain[train.id] = this.selectedDateByTrain[train.id] ?? this.journeyDate;
        });
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.trains = [];
        this.errorMessage = error.message || 'Train search is unavailable right now. Please confirm the backend services are running.';
      },
    });
  }

  private todayString(): string {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 10);
  }
}
