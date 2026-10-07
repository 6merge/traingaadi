import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import {
 CoachType,
 Fare,
 RouteStop,
 STATION_OPTIONS,
 Train,
} from '../../core/models/railway.models';
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
<div
     class="search-summary"
     *ngIf="fromStationId && toStationId"
>
<strong>
       {{ fromStationCode }} · {{ fromStationName }}
</strong>
<span class="divider">→</span>
<strong>
       {{ toStationCode }} · {{ toStationName }}
</strong>
<span class="divider">·</span>
<strong>{{ journeyDate }}</strong>
</div>
<!-- Initial train search loading -->
<div class="loading" *ngIf="isLoading">
<span class="spinner"></span>
<span>Searching for trains...</span>
</div>
<!-- Search error -->
<div class="error-box" *ngIf="errorMessage">
     {{ errorMessage }}
</div>
<!-- No trains -->
<div
     class="empty-state"
     *ngIf="!isLoading && !errorMessage && trains.length === 0"
>
<h3>No trains found</h3>
<p>
       No trains are available for the selected stations.
       Try another route.
</p>
<a
       class="inline-link"
       routerLink="/"
>
       Search again
</a>
</div>
<div style ="background : yellow; color:black; padding:20 px;">

</div>
<!-- TRAIN RESULTS -->
<div
     class="train-list"
     *ngIf="!isLoading && !errorMessage && trains.length > 0"
>
<article
       class="train-card"
       *ngFor="let train of trains; trackBy: trackByTrainId"
>
<!-- Train heading -->
<div class="card-topline">
<div>
<span class="chip">
             {{ train.trainNumber }}
</span>
<h2>{{ train.name }}</h2>
</div>
<span class="status">
           Available
</span>
</div>
<div class="train-id">
         Train ID: {{ train.id }}
</div>
<!-- Travel options -->
<div class="availability-panel">
<label>
<span>Travel date</span>
<input
             type="date"
             [value]="
               selectedDateByTrain[train.id] ?? journeyDate
             "
             (change)="
               selectedDateByTrain[train.id] =
                 $any($event.target).value || journeyDate
             "
           />
</label>
<label>
<span>Coach</span>
<select
             [value]="
               selectedCoachByTrain[train.id] ?? 'General'
             "
             (change)="
               selectedCoachByTrain[train.id] =
                 $any($event.target).value
             "
>
<option value="General">General</option>
<option value="Sleeper">Sleeper</option>
<option value="AC3Tier">AC 3 Tier</option>
<option value="AC2Tier">AC 2 Tier</option>
<option value="AC1Tier">AC 1 Tier</option>
</select>
</label>
</div>
<!-- MAIN ACTIONS -->
<div class="train-actions">
<!-- Check Availability -->
<button
           type="button"
           class="action-button availability-button"
           [disabled]="isAvailabilityLoading(train.id)"
           (click)="checkAvailability(train.id)"
>
<span
             class="spinner small"
             *ngIf="isAvailabilityLoading(train.id)"
></span>
           {{
             isAvailabilityLoading(train.id)
               ? 'Checking...'
               : 'Check availability'
           }}
</button>
<!-- Check Route -->
<button
           type="button"
           class="action-button route-button"
           [disabled]="isRouteLoading(train.id)"
           (click)="checkRoute(train.id)"
>
<span
             class="spinner small"
             *ngIf="isRouteLoading(train.id)"
></span>
           {{
             isRouteLoading(train.id)
               ? 'Loading route...'
               : 'Check route'
           }}
</button>
</div>
<!-- Availability result -->
<div
         class="result-panel"
         *ngIf="availabilityByTrain.has(train.id)"
>
<div class="result-header">
<div>
<span class="result-label">
               Seat availability
</span>
<strong>
               {{
                 getCoachLabel(
                   selectedCoachByTrain[train.id] ?? 'General'
                 )
               }}
</strong>
</div>
<div class="seat-count">
             {{
               availabilityByTrain.get(train.id)?.availableSeats ?? 0
             }}
<span>seats</span>
</div>
</div>
<div class="result-details">
<div>
<span>Date</span>
<strong>
               {{
                 availabilityByTrain.get(train.id)?.journeyDate
               }}
</strong>
</div>
<div>
<span>Fare</span>
<strong>
               ₹{{ fareByTrain.get(train.id)?.amount ?? 0 }}
</strong>
</div>
</div>
</div>
<!-- Route result -->
<div
         class="route-box"
         *ngIf="routeByTrain.has(train.id)"
>
<div class="route-header">
<div>
<span class="result-label">
               Route & schedule
</span>
<h3>
               {{ train.trainNumber }} · {{ train.name }}
</h3>
</div>
</div>
<div class="route-list">
<div
             class="route-stop"
             *ngFor="
               let stop of routeByTrain.get(train.id) ?? [];
               let last = last
             "
>
<div class="route-marker">
<span class="dot"></span>
<span
                 class="line"
                 *ngIf="!last"
></span>
</div>
<div class="route-content">
<div class="station-heading">
<strong>
                   {{ stop.stationCode }}
</strong>
<span>
                   {{ stop.stationName }}
</span>
</div>
<div class="time-row">
<span>
                   Arrival:
<strong>
                     {{ stop.arrivalTime }}
</strong>
</span>
<span>
                   Departure:
<strong>
                     {{ stop.departureTime }}
</strong>
</span>
</div>
</div>
</div>
</div>
</div>
<!-- Bottom actions -->
<div class="bottom-actions">
<a
           class="secondary-link"
           [routerLink]="['/trains', train.id]"
           [queryParams]="{
             fromStationId,
             toStationId,
             journeyDate
           }"
>
           View details
</a>
<a
           class="primary-link"
           [routerLink]="['/booking']"
           [queryParams]="{
             trainId: train.id,
             fromStationId,
             toStationId,
             journeyDate:
               selectedDateByTrain[train.id] ?? journeyDate,
             coachType:
               selectedCoachByTrain[train.id] ?? 'General',
             quota: 'General'
           }"
>
           Continue booking
</a>
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
       color: #0f172a;
     }
     .search-summary {
       display: flex;
       align-items: center;
       flex-wrap: wrap;
       gap: 0.8rem;
       background: linear-gradient(
         90deg,
         #ecfeff,
         #f8fafc
       );
       border: 1px solid #a5f3fc;
       color: #155e75;
       border-radius: 999px;
       padding: 0.8rem 1rem;
       margin-bottom: 1.2rem;
     }
     .divider {
       color: #64748b;
       font-weight: 800;
     }
     .loading {
       display: flex;
       align-items: center;
       gap: 0.7rem;
       background: white;
       border: 1px solid #e2e8f0;
       border-radius: 16px;
       padding: 1.2rem;
       color: #475569;
     }
     .spinner {
       width: 18px;
       height: 18px;
       border: 3px solid #dbeafe;
       border-top-color: #1d4ed8;
       border-radius: 50%;
       display: inline-block;
       animation: spin 0.8s linear infinite;
     }
     .spinner.small {
       width: 13px;
       height: 13px;
       border-width: 2px;
     }
     @keyframes spin {
       to {
         transform: rotate(360deg);
       }
     }
     .error-box {
       background: #fef2f2;
       color: #b91c1c;
       border: 1px solid #fecaca;
       border-radius: 16px;
       padding: 1rem 1.2rem;
       margin-bottom: 1rem;
     }
     .empty-state {
       background: white;
       border: 1px solid #e2e8f0;
       border-radius: 18px;
       padding: 1.5rem;
     }
     .empty-state h3 {
       margin-top: 0;
     }
     .empty-state p {
       color: #64748b;
     }
     .inline-link {
       display: inline-block;
       margin-top: 0.5rem;
       color: #1d4ed8;
       font-weight: 700;
       text-decoration: none;
     }
     .train-list {
       display: grid;
       gap: 1.2rem;
     }
     .train-card {
       background: white;
       border: 1px solid #e2e8f0;
       border-radius: 20px;
       padding: 1.3rem;
       box-shadow:
         0 10px 25px rgba(15, 23, 42, 0.05);
     }
     .card-topline {
       display: flex;
       justify-content: space-between;
       align-items: flex-start;
       gap: 1rem;
     }
     .chip {
       display: inline-block;
       background: #dbeafe;
       color: #1d4ed8;
       border-radius: 999px;
       padding: 0.35rem 0.7rem;
       font-size: 0.8rem;
       font-weight: 800;
     }
     .train-card h2 {
       margin: 0.7rem 0 0.3rem;
       color: #0f172a;
     }
     .status {
       color: #0f766e;
       background: #dcfce7;
       padding: 0.4rem 0.7rem;
       border-radius: 999px;
       font-size: 0.75rem;
       font-weight: 800;
     }
     .train-id {
       color: #64748b;
       font-size: 0.85rem;
       margin-bottom: 1.2rem;
     }
     .availability-panel {
       display: grid;
       grid-template-columns: 1fr 1fr;
       gap: 0.8rem;
       margin-bottom: 1rem;
     }
     .availability-panel label {
       display: block;
     }
     .availability-panel label > span {
       display: block;
       color: #475569;
       font-size: 0.8rem;
       margin-bottom: 0.35rem;
     }
     .availability-panel input,
     .availability-panel select {
       width: 100%;
       box-sizing: border-box;
       border: 1px solid #cbd5e1;
       border-radius: 10px;
       padding: 0.75rem 0.8rem;
       font: inherit;
       background: white;
     }
     .train-actions {
       display: grid;
       grid-template-columns: 1fr 1fr;
       gap: 0.7rem;
     }
     .action-button {
       border: none;
       border-radius: 10px;
       padding: 0.8rem 1rem;
       font: inherit;
       font-weight: 700;
       cursor: pointer;
       display: flex;
       justify-content: center;
       align-items: center;
       gap: 0.5rem;
     }
     .action-button:disabled {
       opacity: 0.7;
       cursor: not-allowed;
     }
     .availability-button {
       background: #dbeafe;
       color: #1d4ed8;
     }
     .route-button {
       background: #ccfbf1;
       color: #0f766e;
     }
     .result-panel {
       margin-top: 1rem;
       padding: 1rem;
       border: 1px solid #a5f3fc;
       border-radius: 14px;
       background: #ecfeff;
     }
     .result-header {
       display: flex;
       justify-content: space-between;
       align-items: center;
       gap: 1rem;
     }
     .result-label {
       display: block;
       color: #64748b;
       font-size: 0.72rem;
       text-transform: uppercase;
       letter-spacing: 0.07em;
       margin-bottom: 0.25rem;
     }
     .result-header strong {
       color: #155e75;
     }
     .seat-count {
       font-size: 1.5rem;
       font-weight: 800;
       color: #0f766e;
     }
     .seat-count span {
       font-size: 0.75rem;
       font-weight: 600;
     }
     .result-details {
       display: grid;
       grid-template-columns: 1fr 1fr;
       gap: 0.7rem;
       margin-top: 0.9rem;
     }
     .result-details div {
       background: white;
       border: 1px solid #cffafe;
       border-radius: 10px;
       padding: 0.7rem;
     }
     .result-details span {
       display: block;
       color: #64748b;
       font-size: 0.72rem;
       margin-bottom: 0.2rem;
     }
     .result-details strong {
       color: #0f172a;
     }
     .route-box {
       margin-top: 1rem;
       border: 1px solid #dbeafe;
       border-radius: 14px;
       padding: 1rem;
       background: #f8fafc;
     }
     .route-header h3 {
       margin: 0;
       color: #0f172a;
     }
     .route-list {
       margin-top: 1rem;
     }
     .route-stop {
       display: flex;
       gap: 0.8rem;
     }
     .route-marker {
       width: 18px;
       display: flex;
       flex-direction: column;
       align-items: center;
     }
     .dot {
       width: 10px;
       height: 10px;
       border-radius: 50%;
       background: #1d4ed8;
       margin-top: 0.35rem;
       flex-shrink: 0;
     }
     .line {
       width: 2px;
       flex: 1;
       min-height: 35px;
       background: #bfdbfe;
     }
     .route-content {
       flex: 1;
       padding-bottom: 0.9rem;
     }
     .station-heading {
       display: flex;
       gap: 0.6rem;
       flex-wrap: wrap;
       align-items: center;
     }
     .station-heading strong {
       color: #1d4ed8;
     }
     .station-heading span {
       color: #334155;
     }
     .time-row {
       display: flex;
       gap: 1rem;
       flex-wrap: wrap;
       margin-top: 0.3rem;
       color: #64748b;
       font-size: 0.78rem;
     }
     .time-row strong {
       color: #334155;
     }
     .bottom-actions {
       display: flex;
       justify-content: flex-end;
       gap: 0.7rem;
       flex-wrap: wrap;
       margin-top: 1.2rem;
       padding-top: 1rem;
       border-top: 1px solid #e2e8f0;
     }
     .bottom-actions a {
       text-decoration: none;
       border-radius: 10px;
       padding: 0.75rem 1rem;
       font-weight: 700;
     }
     .secondary-link {
       border: 1px solid #cbd5e1;
       color: #0f172a;
       background: white;
     }
     .primary-link {
       border: 1px solid #0f172a;
       color: white;
       background: #0f172a;
     }
     @media (max-width: 650px) {
       .availability-panel,
       .train-actions,
       .result-details {
         grid-template-columns: 1fr;
       }
       .search-summary {
         border-radius: 16px;
       }
       .card-topline {
         flex-direction: column;
       }
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
 availabilityByTrain = new Map<
   number,
   {
     availableSeats: number;
     coachType: CoachType;
     journeyDate: string;
   }
>();
 fareByTrain = new Map<
   number,
   {
     amount: number;
     coachType: CoachType;
   }
>();
 routeByTrain = new Map<number, RouteStop[]>();
 /*
  * Separate loading states.
  * This is important because checking one train must not
  * put the entire Find Trains page into a loading state.
  */
 private readonly availabilityLoading = new Set<number>();
 private readonly routeLoading = new Set<number>();
 constructor(
   private readonly route: ActivatedRoute,
   private readonly trainService: TrainService,
   private cdr : ChangeDetectorRef,
   private readonly reservationService: ReservationService,
 ) {}
 ngOnInit(): void {
   this.route.queryParamMap.subscribe((params) => {
     const from = Number(
       params.get('fromStationId') ?? 0,
     );
     const to = Number(
       params.get('toStationId') ?? 0,
     );
     const fromCode =
       params.get('fromStationCode') ??
       this.fromStationCode;
     const toCode =
       params.get('toStationCode') ??
       this.toStationCode;
     const journeyDate =
       params.get('journeyDate') ??
       this.todayString();
     const fromStation =
       STATION_OPTIONS.find(
         (station) => station.id === from,
       ) ??
       STATION_OPTIONS.find(
         (station) => station.code === fromCode,
       );
     const toStation =
       STATION_OPTIONS.find(
         (station) => station.id === to,
       ) ??
       STATION_OPTIONS.find(
         (station) => station.code === toCode,
       );
     if (!from || !to || from === to) {
       this.errorMessage =
         'Please choose two different stations before searching.';
       this.isLoading = false;
       this.trains = [];
       return;
     }
     this.fromStationId = from;
     this.toStationId = to;
     this.fromStationCode =
       fromStation?.code ?? fromCode;
     this.toStationCode =
       toStation?.code ?? toCode;
     this.fromStationName =
       fromStation?.name ?? 'Origin';
     this.toStationName =
       toStation?.name ?? 'Destination';
     this.journeyDate = journeyDate;
     this.loadTrains(from, to);
   });
 }
 /*
  * CHECK AVAILABILITY
  *
  * Only calls availability + fare.
  * Route is deliberately NOT called here.
  *
  * This prevents one route request from holding
  * the availability result.
  */
 checkAvailability(trainId: number): void {
   const coachType =
     (this.selectedCoachByTrain[trainId] ??
       'General') as CoachType;
   const selectedDate =
     this.selectedDateByTrain[trainId] ??
     this.journeyDate;
   this.availabilityLoading.add(trainId);
   this.errorMessage = '';
   forkJoin({
     availability:
       this.reservationService.getAvailability(
         trainId,
         this.fromStationId,
         this.toStationId,
         selectedDate,
         coachType,
       ),
     fare:
       this.trainService.getFare(
         trainId,
         this.fromStationId,
         this.toStationId,
         coachType,
       ),
   })
     .pipe(
       finalize(() => {
         this.availabilityLoading.delete(trainId);
       }),
     )
     .subscribe({
       next: ({ availability, fare }) => {
         this.availabilityByTrain.set(
           trainId,
           {
             availableSeats:
               availability?.availableSeats ?? 0,
             coachType,
             journeyDate:
               selectedDate,
           },
         );
         this.fareByTrain.set(
           trainId,
           {
             amount:
               fare?.amount ?? 0,
             coachType,
           },
         );
         this.cdr.detectChanges(); // Trigger change detection after updating availability and fare
       },
       error: (error: Error) => {
         console.error(
           'Availability request failed:',
           error,
         );
         this.availabilityByTrain.set(
           trainId,
           {
             availableSeats: 0,
             coachType,
             journeyDate: selectedDate,
           },
         );
         this.fareByTrain.delete(trainId);
         this.errorMessage =
           error.message ??
           'Unable to check availability.';
       },
     });
 }
 /*
  * CHECK ROUTE
  *
  * Completely independent from availability.
  */
 checkRoute(trainId: number): void {
   this.routeLoading.add(trainId);
   this.errorMessage = '';
   this.trainService
     .getRoute(trainId)
     .pipe(
       finalize(() => {
         this.routeLoading.delete(trainId);
       }),
     )
     .subscribe({
       next: (route) => {
         this.routeByTrain.set(
           trainId,
           Array.isArray(route)
             ? route
             : [],
         );
         this.cdr.detectChanges(); // Trigger change detection after updating route
       },
       error: (error: Error) => {
         console.error(
           'Route request failed:',
           error,
         );
         this.routeByTrain.delete(trainId);
         this.errorMessage =
           error.message ??
           'Unable to load train route.';
       },
     });
 }
 isAvailabilityLoading(trainId: number): boolean {
   return this.availabilityLoading.has(trainId);
 }
 isRouteLoading(trainId: number): boolean {
   return this.routeLoading.has(trainId);
 }
 getCoachLabel(coachType: CoachType): string {
   if (typeof coachType === 'number') {
     const labels = [
       'General',
       'Sleeper',
       'AC3Tier',
       'AC2Tier',
       'AC1Tier',
     ];
     return labels[coachType] ?? String(coachType);
   }
   return String(
     coachType ?? 'General',
   );
 }
 getRouteSummary(trainId: number): string {
   const route =
     this.routeByTrain.get(trainId) ?? [];
   if (route.length === 0) {
     return 'Not available';
   }
   return route
     .map(
       (stop) =>
         stop.stationCode,
     )
     .join(' → ');
 }
 trackByTrainId(
   index: number,
   train: Train,
 ): number {
   return train.id;
 }
 private loadTrains(
   fromStationId: number,
   toStationId: number,
 ): void {
   console.log("LLOAD TRAINS CALLED",fromStationId,toStationId,new Date().toISOString());


   this.isLoading = true;
   this.errorMessage = '';
   this.trains = [];
   this.availabilityByTrain.clear();
   this.routeByTrain.clear();
   this.fareByTrain.clear();
   this.trainService
     .searchTrains(
       fromStationId,
       toStationId,
     )
     .pipe(
       /*
        * This is the important part:
        * loading ALWAYS ends when the request ends,
        * regardless of success or failure.
        */
       finalize(() => {
         this.isLoading = false;
       }),
     )
     .subscribe({
  next: (trains) => {
 console.log('Train search response:', trains);
 // Handle both:
 // [ {...}, {...} ]
 // and
 // { data: [ {...}, {...} ] }
 const trainList = Array.isArray(trains)
   ? trains
   : Array.isArray((trains as any)?.data)
     ? (trains as any).data
     : [];
 this.trains = trainList;
 this.trains.forEach((train) => {
   this.selectedCoachByTrain[train.id] =
     this.selectedCoachByTrain[train.id] ?? 'General';
   this.selectedDateByTrain[train.id] =
     this.selectedDateByTrain[train.id] ?? this.journeyDate;
 });
 console.log('Trains assigned to UI:', this.trains);
 this.isLoading = false;
 this.cdr.detectChanges(); // Trigger change detection after updating trains

},
error: (error) => {
 console.error('Train search failed:', error);
 this.trains = [];
 this.errorMessage =
   error?.error?.message ??
   error?.message ??
   'Train search is unavailable right now.';
 this.isLoading = false;
},

     });
 }
 private todayString(): string {
   const today = new Date();
   const offset =
     today.getTimezoneOffset();
   const localDate = new Date(
     today.getTime() -
       offset * 60 * 1000,
   );
   return localDate
     .toISOString()
     .slice(0, 10);
 }
}
