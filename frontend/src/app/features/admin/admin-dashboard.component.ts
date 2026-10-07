import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
 FormBuilder,
 FormGroup,
 ReactiveFormsModule,
 Validators,
} from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import {
 CoachAdminRequest,
 CoachRequest,
 FareAdminRequest,
 RouteStopAdminRequest,
 RouteStopRequest,
 SeatAdminRequest,
 SeatRequest,
 StationAdminRequest,
 TrainAdminRequest,
} from '../../core/models/railway.models';
@Component({
 selector: 'app-admin-dashboard',
 standalone: true,
 imports: [CommonModule, ReactiveFormsModule],
 template: `
<div class="admin-page">
<!-- ============================================================= -->
<!-- HEADER -->
<!-- ============================================================= -->
<section class="page-header">
<div>
<p class="eyebrow">ADMIN PANEL</p>
<h1>Railway Management</h1>
<p class="subtitle">
           Manage trains, stations, routes, coaches, seats and fares.
</p>
</div>
</section>
<!-- ============================================================= -->
<!-- GLOBAL MESSAGES -->
<!-- ============================================================= -->
<div
       class="message error-message"
       *ngIf="errorMessage"
>
       {{ errorMessage }}
</div>
<div
       class="message success-message"
       *ngIf="successMessage"
>
       {{ successMessage }}
</div>
<!-- ============================================================= -->
<!-- TRAIN MANAGEMENT -->
<!-- ============================================================= -->
<section class="management-section">
<div class="section-heading">
<div>
<p class="section-number">01</p>
<h2>Train Management</h2>
<p>Add, update or remove trains.</p>
</div>
</div>
<div class="form-grid">
<!-- CREATE TRAIN -->
<form
           class="panel"
           [formGroup]="trainCreateForm"
           (ngSubmit)="createTrain()"
>
<h3>Add Train</h3>
<label>
<span>Train Number</span>
<input
               type="text"
               formControlName="trainNumber"
               placeholder="12345"
             />
</label>
<label>
<span>Train Name</span>
<input
               type="text"
               formControlName="name"
               placeholder="Rajdhani Express"
             />
</label>
<button
             type="submit"
             [disabled]="trainCreateForm.invalid || isSubmitting"
>
             Add Train
</button>
</form>
<!-- UPDATE TRAIN -->
<form
           class="panel"
           [formGroup]="trainUpdateForm"
           (ngSubmit)="updateTrain()"
>
<h3>Update Train</h3>
<label>
<span>Train ID</span>
<input
               type="number"
               formControlName="id"
               min="1"
             />
</label>
<label>
<span>Train Number</span>
<input
               type="text"
               formControlName="trainNumber"
             />
</label>
<label>
<span>Train Name</span>
<input
               type="text"
               formControlName="name"
             />
</label>
<button
             type="submit"
             [disabled]="trainUpdateForm.invalid || isSubmitting"
>
             Update Train
</button>
</form>
<!-- DELETE TRAIN -->
<form
           class="panel danger-panel"
           [formGroup]="trainDeleteForm"
           (ngSubmit)="deleteTrain()"
>
<h3>Delete Train</h3>
<label>
<span>Train ID</span>
<input
               type="number"
               formControlName="id"
               min="1"
             />
</label>
<button
             type="submit"
             class="danger-button"
             [disabled]="trainDeleteForm.invalid || isSubmitting"
>
             Delete Train
</button>
</form>
</div>
</section>
<!-- ============================================================= -->
<!-- STATION MANAGEMENT -->
<!-- ============================================================= -->
<section class="management-section">
<div class="section-heading">
<div>
<p class="section-number">02</p>
<h2>Station Management</h2>
<p>Manage railway stations and station codes.</p>
</div>
</div>
<div class="form-grid">
<!-- CREATE STATION -->
<form
           class="panel"
           [formGroup]="stationCreateForm"
           (ngSubmit)="createStation()"
>
<h3>Add Station</h3>
<label>
<span>Station Code</span>
<input
               type="text"
               formControlName="code"
               placeholder="NDLS"
             />
</label>
<label>
<span>Station Name</span>
<input
               type="text"
               formControlName="name"
               placeholder="New Delhi"
             />
</label>
<button
             type="submit"
             [disabled]="stationCreateForm.invalid || isSubmitting"
>
             Add Station
</button>
</form>
<!-- UPDATE STATION -->
<form
           class="panel"
           [formGroup]="stationUpdateForm"
           (ngSubmit)="updateStation()"
>
<h3>Update Station</h3>
<label>
<span>Station ID</span>
<input
               type="number"
               formControlName="id"
               min="1"
             />
</label>
<label>
<span>Station Code</span>
<input
               type="text"
               formControlName="code"
             />
</label>
<label>
<span>Station Name</span>
<input
               type="text"
               formControlName="name"
             />
</label>
<button
             type="submit"
             [disabled]="stationUpdateForm.invalid || isSubmitting"
>
             Update Station
</button>
</form>
<!-- DELETE STATION -->
<form
           class="panel danger-panel"
           [formGroup]="stationDeleteForm"
           (ngSubmit)="deleteStation()"
>
<h3>Delete Station</h3>
<label>
<span>Station ID</span>
<input
               type="number"
               formControlName="id"
               min="1"
             />
</label>
<button
             type="submit"
             class="danger-button"
             [disabled]="stationDeleteForm.invalid || isSubmitting"
>
             Delete Station
</button>
</form>
</div>
</section>
<!-- ============================================================= -->
<!-- ROUTE STOP MANAGEMENT -->
<!-- ============================================================= -->
<section class="management-section">
<div class="section-heading">
<div>
<p class="section-number">03</p>
<h2>Route Management</h2>
<p>Configure stations and timings for each train.</p>
</div>
</div>
<div class="form-grid">
<!-- CREATE ROUTE STOP -->
<form
           class="panel"
           [formGroup]="routeCreateForm"
           (ngSubmit)="createRouteStop()"
>
<h3>Add Route Stop</h3>
<label>
<span>Train ID</span>
<input
               type="number"
               formControlName="trainId"
               min="1"
             />
</label>
<label>
<span>Station ID</span>
<input
               type="number"
               formControlName="stationId"
               min="1"
             />
</label>
<label>
<span>Stop Order</span>
<input
               type="number"
               formControlName="stopOrder"
               min="1"
             />
</label>
<label>
<span>Arrival Time</span>
<input
               type="time"
               formControlName="arrivalTime"
             />
</label>
<label>
<span>Departure Time</span>
<input
               type="time"
               formControlName="departureTime"
             />
</label>
<button
             type="submit"
             [disabled]="routeCreateForm.invalid || isSubmitting"
>
             Add Route Stop
</button>
</form>
<!-- GET ROUTE -->
<form
           class="panel"
           [formGroup]="routeGetForm"
           (ngSubmit)="getRouteStops()"
>
<h3>View Train Route</h3>
<label>
<span>Train ID</span>
<input
               type="number"
               formControlName="trainId"
               min="1"
             />
</label>
<button
             type="submit"
             [disabled]="routeGetForm.invalid || isSubmitting"
>
             Load Route
</button>
<div
             class="route-results"
             *ngIf="routeStops.length > 0"
>
<div
               class="route-item"
               *ngFor="let stop of routeStops"
>
<div>
<strong>
                   {{ stop.stopOrder }}.
                   {{ stop.stationName }}
</strong>
<span *ngIf="stop.stationCode">
                   ({{ stop.stationCode }})
</span>
</div>
<small>
                 Arrival: {{ stop.arrivalTime }}
<br />
                 Departure: {{ stop.departureTime }}
</small>
</div>
</div>
<p
             class="empty-message"
             *ngIf="routeLoaded && routeStops.length === 0"
>
             No route stops found.
</p>
</form>
<!-- UPDATE ROUTE STOP -->
<form
           class="panel"
           [formGroup]="routeUpdateForm"
           (ngSubmit)="updateRouteStop()"
>
<h3>Update Route Stop</h3>
<label>
<span>Route Stop ID</span>
<input
               type="number"
               formControlName="id"
               min="1"
             />
</label>
<label>
<span>Train ID</span>
<input
               type="number"
               formControlName="trainId"
               min="1"
             />
</label>
<label>
<span>Station ID</span>
<input
               type="number"
               formControlName="stationId"
               min="1"
             />
</label>
<label>
<span>Stop Order</span>
<input
               type="number"
               formControlName="stopOrder"
               min="1"
             />
</label>
<label>
<span>Arrival Time</span>
<input
               type="time"
               formControlName="arrivalTime"
             />
</label>
<label>
<span>Departure Time</span>
<input
               type="time"
               formControlName="departureTime"
             />
</label>
<button
             type="submit"
             [disabled]="routeUpdateForm.invalid || isSubmitting"
>
             Update Route Stop
</button>
</form>
<!-- DELETE ROUTE STOP -->
<form
           class="panel danger-panel"
           [formGroup]="routeDeleteForm"
           (ngSubmit)="deleteRouteStop()"
>
<h3>Delete Route Stop</h3>
<label>
<span>Route Stop ID</span>
<input
               type="number"
               formControlName="id"
               min="1"
             />
</label>
<button
             type="submit"
             class="danger-button"
             [disabled]="routeDeleteForm.invalid || isSubmitting"
>
             Delete Route Stop
</button>
</form>
</div>
</section>
<!-- ============================================================= -->
<!-- COACH MANAGEMENT -->
<!-- ============================================================= -->
<section class="management-section">
<div class="section-heading">
<div>
<p class="section-number">04</p>
<h2>Coach Management</h2>
<p>Add and manage coaches belonging to trains.</p>
</div>
</div>
<div class="form-grid">
<!-- CREATE COACH -->
<form
           class="panel"
           [formGroup]="coachCreateForm"
           (ngSubmit)="createCoach()"
>
<h3>Add Coach</h3>
<label>
<span>Train ID</span>
<input
               type="number"
               formControlName="trainId"
               min="1"
             />
</label>
<label>
<span>Coach Number</span>
<input
               type="text"
               formControlName="coachNumber"
               placeholder="A1"
             />
</label>
<label>
<span>Coach Type</span>
<select formControlName="coachType">
<option [ngValue]="0">Sleeper</option>
<option [ngValue]="1">AC</option>
<option [ngValue]="2">First AC</option>
<option [ngValue]="3">Second AC</option>
<option [ngValue]="4">Third AC</option>
</select>
</label>
<button
             type="submit"
             [disabled]="coachCreateForm.invalid || isSubmitting"
>
             Add Coach
</button>
</form>
<!-- UPDATE COACH -->
<form
           class="panel"
           [formGroup]="coachUpdateForm"
           (ngSubmit)="updateCoach()"
>
<h3>Update Coach</h3>
<label>
<span>Coach ID</span>
<input
               type="number"
               formControlName="id"
               min="1"
             />
</label>
<label>
<span>Train ID</span>
<input
               type="number"
               formControlName="trainId"
               min="1"
             />
</label>
<label>
<span>Coach Number</span>
<input
               type="text"
               formControlName="coachNumber"
             />
</label>
<label>
<span>Coach Type</span>
<select formControlName="coachType">
<option [ngValue]="0">Sleeper</option>
<option [ngValue]="1">AC</option>
<option [ngValue]="2">First AC</option>
<option [ngValue]="3">Second AC</option>
<option [ngValue]="4">Third AC</option>
</select>
</label>
<button
             type="submit"
             [disabled]="coachUpdateForm.invalid || isSubmitting"
>
             Update Coach
</button>
</form>
<!-- DELETE COACH -->
<form
           class="panel danger-panel"
           [formGroup]="coachDeleteForm"
           (ngSubmit)="deleteCoach()"
>
<h3>Delete Coach</h3>
<label>
<span>Coach ID</span>
<input
               type="number"
               formControlName="id"
               min="1"
             />
</label>
<button
             type="submit"
             class="danger-button"
             [disabled]="coachDeleteForm.invalid || isSubmitting"
>
             Delete Coach
</button>
</form>
</div>
</section>
<!-- ============================================================= -->
<!-- SEAT MANAGEMENT -->
<!-- ============================================================= -->
<section class="management-section">
<div class="section-heading">
<div>
<p class="section-number">05</p>
<h2>Seat Management</h2>
<p>Create, update and remove seats inside coaches.</p>
</div>
</div>
<div class="form-grid">
<!-- CREATE SEAT -->
<form
           class="panel"
           [formGroup]="seatCreateForm"
           (ngSubmit)="createSeat()"
>
<h3>Add Seat</h3>
<label>
<span>Coach ID</span>
<input
               type="number"
               formControlName="coachId"
               min="1"
             />
</label>
<label>
<span>Seat Number</span>
<input
               type="text"
               formControlName="seatNumber"
               placeholder="1"
             />
</label>
<button
             type="submit"
             [disabled]="seatCreateForm.invalid || isSubmitting"
>
             Add Seat
</button>
</form>
<!-- UPDATE SEAT -->
<form
           class="panel"
           [formGroup]="seatUpdateForm"
           (ngSubmit)="updateSeat()"
>
<h3>Update Seat</h3>
<label>
<span>Seat ID</span>
<input
               type="number"
               formControlName="id"
               min="1"
             />
</label>
<label>
<span>Coach ID</span>
<input
               type="number"
               formControlName="coachId"
               min="1"
             />
</label>
<label>
<span>Seat Number</span>
<input
               type="text"
               formControlName="seatNumber"
             />
</label>
<button
             type="submit"
             [disabled]="seatUpdateForm.invalid || isSubmitting"
>
             Update Seat
</button>
</form>
<!-- DELETE SEAT -->
<form
           class="panel danger-panel"
           [formGroup]="seatDeleteForm"
           (ngSubmit)="deleteSeat()"
>
<h3>Delete Seat</h3>
<label>
<span>Seat ID</span>
<input
               type="number"
               formControlName="id"
               min="1"
             />
</label>
<button
             type="submit"
             class="danger-button"
             [disabled]="seatDeleteForm.invalid || isSubmitting"
>
             Delete Seat
</button>
</form>
</div>
</section>
<!-- ============================================================= -->
<!-- FARE MANAGEMENT -->
<!-- ============================================================= -->
<section class="management-section">
<div class="section-heading">
<div>
<p class="section-number">06</p>
<h2>Fare Management</h2>
<p>Configure fares between stations for each coach type.</p>
</div>
</div>
<div class="form-grid">
<!-- CREATE FARE -->
<form
           class="panel"
           [formGroup]="fareCreateForm"
           (ngSubmit)="createFare()"
>
<h3>Add Fare</h3>
<label>
<span>Train ID</span>
<input
               type="number"
               formControlName="trainId"
               min="1"
             />
</label>
<label>
<span>From Station ID</span>
<input
               type="number"
               formControlName="fromStationId"
               min="1"
             />
</label>
<label>
<span>To Station ID</span>
<input
               type="number"
               formControlName="toStationId"
               min="1"
             />
</label>
<label>
<span>Coach Type</span>
<select formControlName="coachType">
<option [ngValue]="0">Sleeper</option>
<option [ngValue]="1">AC</option>
<option [ngValue]="2">First AC</option>
<option [ngValue]="3">Second AC</option>
<option [ngValue]="4">Third AC</option>
</select>
</label>
<label>
<span>Fare Amount</span>
<input
               type="number"
               formControlName="amount"
               min="1"
               step="0.01"
               placeholder="2500"
             />
</label>
<button
             type="submit"
             [disabled]="fareCreateForm.invalid || isSubmitting"
>
             Add Fare
</button>
</form>
<!-- UPDATE FARE -->
<form
           class="panel"
           [formGroup]="fareUpdateForm"
           (ngSubmit)="updateFare()"
>
<h3>Update Fare</h3>
<label>
<span>Fare ID</span>
<input
               type="number"
               formControlName="id"
               min="1"
             />
</label>
<label>
<span>Train ID</span>
<input
               type="number"
               formControlName="trainId"
               min="1"
             />
</label>
<label>
<span>From Station ID</span>
<input
               type="number"
               formControlName="fromStationId"
               min="1"
             />
</label>
<label>
<span>To Station ID</span>
<input
               type="number"
               formControlName="toStationId"
               min="1"
             />
</label>
<label>
<span>Coach Type</span>
<select formControlName="coachType">
<option [ngValue]="0">Sleeper</option>
<option [ngValue]="1">AC</option>
<option [ngValue]="2">First AC</option>
<option [ngValue]="3">Second AC</option>
<option [ngValue]="4">Third AC</option>
</select>
</label>
<label>
<span>Fare Amount</span>
<input
               type="number"
               formControlName="amount"
               min="1"
               step="0.01"
             />
</label>
<button
             type="submit"
             [disabled]="fareUpdateForm.invalid || isSubmitting"
>
             Update Fare
</button>
</form>
<!-- DELETE FARE -->
<form
           class="panel danger-panel"
           [formGroup]="fareDeleteForm"
           (ngSubmit)="deleteFare()"
>
<h3>Delete Fare</h3>
<label>
<span>Fare ID</span>
<input
               type="number"
               formControlName="id"
               min="1"
             />
</label>
<button
             type="submit"
             class="danger-button"
             [disabled]="fareDeleteForm.invalid || isSubmitting"
>
             Delete Fare
</button>
</form>
</div>
</section>
</div>
 `,
 styles: [`
   :host {
     display: block;
     min-height: 100vh;
     background: #f5f7fb;
   }
   * {
     box-sizing: border-box;
   }
   .admin-page {
     max-width: 1400px;
     margin: 0 auto;
     padding: 40px 28px 80px;
   }
   .page-header {
     margin-bottom: 36px;
   }
   .eyebrow,
   .section-number {
     margin: 0 0 8px;
     font-size: 12px;
     font-weight: 800;
     letter-spacing: 0.12em;
     text-transform: uppercase;
     color: #2563eb;
   }
   h1 {
     margin: 0;
     font-size: clamp(30px, 4vw, 46px);
     line-height: 1.1;
     color: #111827;
   }
   .subtitle {
     margin: 12px 0 0;
     color: #6b7280;
     font-size: 15px;
   }
   .message {
     margin-bottom: 24px;
     padding: 14px 16px;
     border-radius: 10px;
     font-size: 14px;
     font-weight: 600;
   }
   .error-message {
     background: #fef2f2;
     border: 1px solid #fecaca;
     color: #b91c1c;
   }
   .success-message {
     background: #f0fdf4;
     border: 1px solid #bbf7d0;
     color: #15803d;
   }
   .management-section {
     margin-top: 48px;
   }
   .section-heading {
     margin-bottom: 20px;
   }
   .section-heading h2 {
     margin: 0;
     font-size: 24px;
     color: #111827;
   }
   .section-heading p:last-child {
     margin: 6px 0 0;
     color: #6b7280;
     font-size: 14px;
   }
   .section-number {
     margin-bottom: 6px;
   }
   .form-grid {
     display: grid;
     grid-template-columns: repeat(3, minmax(0, 1fr));
     gap: 20px;
   }
   .panel {
     padding: 24px;
     background: #ffffff;
     border: 1px solid #e5e7eb;
     border-radius: 14px;
     box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
   }
   .panel h3 {
     margin: 0 0 22px;
     color: #111827;
     font-size: 18px;
   }
   label {
     display: block;
     margin-bottom: 16px;
   }
   label span {
     display: block;
     margin-bottom: 7px;
     font-size: 13px;
     font-weight: 700;
     color: #374151;
   }
   input,
   select {
     width: 100%;
     min-height: 44px;
     padding: 10px 12px;
     border: 1px solid #d1d5db;
     border-radius: 8px;
     background: #ffffff;
     color: #111827;
     font: inherit;
     outline: none;
   }
   input:focus,
   select:focus {
     border-color: #2563eb;
     box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
   }
   button {
     width: 100%;
     min-height: 44px;
     margin-top: 4px;
     padding: 10px 16px;
     border: 0;
     border-radius: 8px;
     background: #2563eb;
     color: #ffffff;
     font-size: 14px;
     font-weight: 700;
     cursor: pointer;
     transition: 0.15s ease;
   }
   button:hover:not(:disabled) {
     background: #1d4ed8;
   }
   button:disabled {
     opacity: 0.55;
     cursor: not-allowed;
   }
   .danger-panel {
     border-color: #fee2e2;
   }
   .danger-button {
     background: #dc2626;
   }
   .danger-button:hover:not(:disabled) {
     background: #b91c1c;
   }
   .route-results {
     margin-top: 20px;
     border-top: 1px solid #e5e7eb;
   }
   .route-item {
     padding: 13px 0;
     border-bottom: 1px solid #f0f0f0;
   }
   .route-item strong {
     color: #111827;
     font-size: 14px;
   }
   .route-item span {
     color: #6b7280;
     font-size: 13px;
   }
   .route-item small {
     display: block;
     margin-top: 5px;
     color: #6b7280;
     line-height: 1.5;
   }
   .empty-message {
     margin-top: 18px;
     color: #6b7280;
     font-size: 13px;
   }
   @media (max-width: 1100px) {
     .form-grid {
       grid-template-columns: repeat(2, minmax(0, 1fr));
     }
   }
   @media (max-width: 700px) {
     .admin-page {
       padding: 28px 16px 60px;
     }
     .form-grid {
       grid-template-columns: 1fr;
     }
     .panel {
       padding: 20px;
     }
   }
 `],
})
export class AdminDashboardComponent {
 // ========================================================================
 // STATE
 // ========================================================================
 isSubmitting = false;
 errorMessage = '';
 successMessage = '';
 routeStops: any[] = [];
 routeLoaded = false;
 // ========================================================================
 // TRAIN FORMS
 // ========================================================================
 trainCreateForm: FormGroup;
 trainUpdateForm: FormGroup;
 trainDeleteForm: FormGroup;
 // ========================================================================
 // STATION FORMS
 // ========================================================================
 stationCreateForm: FormGroup;
 stationUpdateForm: FormGroup;
 stationDeleteForm: FormGroup;
 // ========================================================================
 // ROUTE FORMS
 // ========================================================================
 routeCreateForm: FormGroup;
 routeGetForm: FormGroup;
 routeUpdateForm: FormGroup;
 routeDeleteForm: FormGroup;
 // ========================================================================
 // COACH FORMS
 // ========================================================================
 coachCreateForm: FormGroup;
 coachUpdateForm: FormGroup;
 coachDeleteForm: FormGroup;
 // ========================================================================
 // SEAT FORMS
 // ========================================================================
 seatCreateForm: FormGroup;
 seatUpdateForm: FormGroup;
 seatDeleteForm: FormGroup;
 // ========================================================================
 // FARE FORMS
 // ========================================================================
 fareCreateForm: FormGroup;
 fareUpdateForm: FormGroup;
 fareDeleteForm: FormGroup;
 constructor(
   private readonly fb: FormBuilder,
   private readonly adminService: AdminService
 ) {
   // TRAIN
   this.trainCreateForm = this.fb.group({
     trainNumber: ['', [Validators.required]],
     name: ['', [Validators.required]],
   });
   this.trainUpdateForm = this.fb.group({
     id: [0, [Validators.required, Validators.min(1)]],
     trainNumber: ['', [Validators.required]],
     name: ['', [Validators.required]],
   });
   this.trainDeleteForm = this.fb.group({
     id: [0, [Validators.required, Validators.min(1)]],
   });
   // STATION
   this.stationCreateForm = this.fb.group({
     code: ['', [Validators.required]],
     name: ['', [Validators.required]],
   });
   this.stationUpdateForm = this.fb.group({
     id: [0, [Validators.required, Validators.min(1)]],
     code: ['', [Validators.required]],
     name: ['', [Validators.required]],
   });
   this.stationDeleteForm = this.fb.group({
     id: [0, [Validators.required, Validators.min(1)]],
   });
   // ROUTE
   this.routeCreateForm = this.fb.group({
     trainId: [0, [Validators.required, Validators.min(1)]],
     stationId: [0, [Validators.required, Validators.min(1)]],
     stopOrder: [1, [Validators.required, Validators.min(1)]],
     arrivalTime: ['', [Validators.required]],
     departureTime: ['', [Validators.required]],
   });
   this.routeGetForm = this.fb.group({
     trainId: [0, [Validators.required, Validators.min(1)]],
   });
   this.routeUpdateForm = this.fb.group({
     id: [0, [Validators.required, Validators.min(1)]],
     trainId: [0, [Validators.required, Validators.min(1)]],
     stationId: [0, [Validators.required, Validators.min(1)]],
     stopOrder: [1, [Validators.required, Validators.min(1)]],
     arrivalTime: ['', [Validators.required]],
     departureTime: ['', [Validators.required]],
   });
   this.routeDeleteForm = this.fb.group({
     id: [0, [Validators.required, Validators.min(1)]],
   });
   // COACH
   this.coachCreateForm = this.fb.group({
     trainId: [0, [Validators.required, Validators.min(1)]],
     coachNumber: ['', [Validators.required]],
     coachType: [0, [Validators.required]],
   });
   this.coachUpdateForm = this.fb.group({
     id: [0, [Validators.required, Validators.min(1)]],
     trainId: [0, [Validators.required, Validators.min(1)]],
     coachNumber: ['', [Validators.required]],
     coachType: [0, [Validators.required]],
   });
   this.coachDeleteForm = this.fb.group({
     id: [0, [Validators.required, Validators.min(1)]],
   });
   // SEAT
   this.seatCreateForm = this.fb.group({
     coachId: [0, [Validators.required, Validators.min(1)]],
     seatNumber: ['', [Validators.required]],
   });
   this.seatUpdateForm = this.fb.group({
     id: [0, [Validators.required, Validators.min(1)]],
     coachId: [0, [Validators.required, Validators.min(1)]],
     seatNumber: ['', [Validators.required]],
   });
   this.seatDeleteForm = this.fb.group({
     id: [0, [Validators.required, Validators.min(1)]],
   });
   // FARE
   this.fareCreateForm = this.fb.group({
     trainId: [0, [Validators.required, Validators.min(1)]],
     fromStationId: [0, [Validators.required, Validators.min(1)]],
     toStationId: [0, [Validators.required, Validators.min(1)]],
     coachType: [0, [Validators.required]],
     amount: [0, [Validators.required, Validators.min(1)]],
   });
   this.fareUpdateForm = this.fb.group({
     id: [0, [Validators.required, Validators.min(1)]],
     trainId: [0, [Validators.required, Validators.min(1)]],
     fromStationId: [0, [Validators.required, Validators.min(1)]],
     toStationId: [0, [Validators.required, Validators.min(1)]],
     coachType: [0, [Validators.required]],
     amount: [0, [Validators.required, Validators.min(1)]],
   });
   this.fareDeleteForm = this.fb.group({
     id: [0, [Validators.required, Validators.min(1)]],
   });
 }
 // ========================================================================
 // COMMON
 // ========================================================================
 private startRequest(): void {
   this.isSubmitting = true;
   this.errorMessage = '';
   this.successMessage = '';
 }
 private success(message: string): void {
   this.isSubmitting = false;
   this.successMessage = message;
   this.errorMessage = '';
 }
 private failure(error: any): void {
   this.isSubmitting = false;
   if (error?.error?.message) {
     this.errorMessage = error.error.message;
   } else if (error?.error?.title) {
     this.errorMessage = error.error.title;
   } else if (error?.message) {
     this.errorMessage = error.message;
   } else {
     this.errorMessage = 'The request could not be completed.';
   }
   this.successMessage = '';
 }
 // ========================================================================
 // TRAIN
 // ========================================================================
 createTrain(): void {
   if (this.trainCreateForm.invalid) {
     this.trainCreateForm.markAllAsTouched();
     return;
   }
   this.startRequest();
   const payload: TrainAdminRequest = {
     trainNumber: this.trainCreateForm.value.trainNumber,
     name: this.trainCreateForm.value.name,
   };
   this.adminService.createTrain(payload).subscribe({
     next: () => {
       this.success('Train created successfully.');
       this.trainCreateForm.reset({
         trainNumber: '',
         name: '',
       });
     },
     error: (error) => this.failure(error),
   });
 }
 updateTrain(): void {
   if (this.trainUpdateForm.invalid) {
     this.trainUpdateForm.markAllAsTouched();
     return;
   }
   this.startRequest();
   const value = this.trainUpdateForm.value;
   const payload: TrainAdminRequest = {
     trainNumber: value.trainNumber,
     name: value.name,
   };
   this.adminService.updateTrain(Number(value.id), payload).subscribe({
     next: () => {
       this.success('Train updated successfully.');
     },
     error: (error) => this.failure(error),
   });
 }
 deleteTrain(): void {
   if (this.trainDeleteForm.invalid) {
     this.trainDeleteForm.markAllAsTouched();
     return;
   }
   const id = Number(this.trainDeleteForm.value.id);
   if (!confirm(`Delete train with ID ${id}?`)) {
     return;
   }
   this.startRequest();
   this.adminService.deleteTrain(id).subscribe({
     next: () => {
       this.success('Train deleted successfully.');
       this.trainDeleteForm.reset({ id: 0 });
     },
     error: (error) => this.failure(error),
   });
 }
 // ========================================================================
 // STATION
 // ========================================================================
 createStation(): void {
   if (this.stationCreateForm.invalid) {
     this.stationCreateForm.markAllAsTouched();
     return;
   }
   this.startRequest();
   const value = this.stationCreateForm.value;
   const payload: StationAdminRequest = {
     code: value.code,
     name: value.name,
   };
   this.adminService.createStation(payload).subscribe({
     next: () => {
       this.success('Station created successfully.');
       this.stationCreateForm.reset({
         code: '',
         name: '',
       });
     },
     error: (error) => this.failure(error),
   });
 }
 updateStation(): void {
   if (this.stationUpdateForm.invalid) {
     this.stationUpdateForm.markAllAsTouched();
     return;
   }
   this.startRequest();
   const value = this.stationUpdateForm.value;
   const payload: StationAdminRequest = {
     code: value.code,
     name: value.name,
   };
   this.adminService
     .updateStation(Number(value.id), payload)
     .subscribe({
       next: () => {
         this.success('Station updated successfully.');
       },
       error: (error) => this.failure(error),
     });
 }
 deleteStation(): void {
   if (this.stationDeleteForm.invalid) {
     this.stationDeleteForm.markAllAsTouched();
     return;
   }
   const id = Number(this.stationDeleteForm.value.id);
   if (!confirm(`Delete station with ID ${id}?`)) {
     return;
   }
   this.startRequest();
   this.adminService.deleteStation(id).subscribe({
     next: () => {
       this.success('Station deleted successfully.');
       this.stationDeleteForm.reset({ id: 0 });
     },
     error: (error) => this.failure(error),
   });
 }
 // ========================================================================
 // ROUTE STOP
 // ========================================================================
 createRouteStop(): void {
   if (this.routeCreateForm.invalid) {
     this.routeCreateForm.markAllAsTouched();
     return;
   }
   this.startRequest();
   const value = this.routeCreateForm.value;
   const payload: RouteStopRequest = {
     stationId: Number(value.stationId),
     stopOrder: Number(value.stopOrder),
     arrivalTime: value.arrivalTime,
     departureTime: value.departureTime,
   };
   this.adminService
     .createRouteStop(Number(value.trainId), payload)
     .subscribe({
       next: () => {
         this.success('Route stop created successfully.');
       },
       error: (error) => this.failure(error),
     });
 }
 getRouteStops(): void {
   if (this.routeGetForm.invalid) {
     this.routeGetForm.markAllAsTouched();
     return;
   }
   this.startRequest();
   this.routeLoaded = false;
   const trainId = Number(this.routeGetForm.value.trainId);
   this.adminService.getRouteStops(trainId).subscribe({
     next: (stops) => {
       this.routeStops = stops;
       this.routeLoaded = true;
       this.isSubmitting = false;
       this.errorMessage = '';
     },
     error: (error) => {
       this.routeStops = [];
       this.routeLoaded = true;
       this.failure(error);
     },
   });
 }
 updateRouteStop(): void {
   if (this.routeUpdateForm.invalid) {
     this.routeUpdateForm.markAllAsTouched();
     return;
   }
   this.startRequest();
   const value = this.routeUpdateForm.value;
   const payload: RouteStopAdminRequest = {
     trainId: Number(value.trainId),
     stationId: Number(value.stationId),
     stopOrder: Number(value.stopOrder),
     arrivalTime: value.arrivalTime,
     departureTime: value.departureTime,
   };
   this.adminService
     .updateRouteStop(Number(value.id), payload)
     .subscribe({
       next: () => {
         this.success('Route stop updated successfully.');
       },
       error: (error) => this.failure(error),
     });
 }
 deleteRouteStop(): void {
   if (this.routeDeleteForm.invalid) {
     this.routeDeleteForm.markAllAsTouched();
     return;
   }
   const id = Number(this.routeDeleteForm.value.id);
   if (!confirm(`Delete route stop with ID ${id}?`)) {
     return;
   }
   this.startRequest();
   this.adminService.deleteRouteStop(id).subscribe({
     next: () => {
       this.success('Route stop deleted successfully.');
       this.routeDeleteForm.reset({ id: 0 });
     },
     error: (error) => this.failure(error),
   });
 }
 // ========================================================================
 // COACH
 // ========================================================================
 createCoach(): void {
   if (this.coachCreateForm.invalid) {
     this.coachCreateForm.markAllAsTouched();
     return;
   }
   this.startRequest();
   const value = this.coachCreateForm.value;
   const payload: CoachRequest = {
     coachNumber: value.coachNumber,
     coachType: Number(value.coachType),
   };
   this.adminService
     .createCoach(Number(value.trainId), payload)
     .subscribe({
       next: () => {
         this.success('Coach created successfully.');
       },
       error: (error) => this.failure(error),
     });
 }
 updateCoach(): void {
   if (this.coachUpdateForm.invalid) {
     this.coachUpdateForm.markAllAsTouched();
     return;
   }
   this.startRequest();
   const value = this.coachUpdateForm.value;
   const payload: CoachAdminRequest = {
     trainId: Number(value.trainId),
     coachNumber: value.coachNumber,
     coachType: Number(value.coachType),
   };
   this.adminService
     .updateCoach(Number(value.id), payload)
     .subscribe({
       next: () => {
         this.success('Coach updated successfully.');
       },
       error: (error) => this.failure(error),
     });
 }
 deleteCoach(): void {
   if (this.coachDeleteForm.invalid) {
     this.coachDeleteForm.markAllAsTouched();
     return;
   }
   const id = Number(this.coachDeleteForm.value.id);
   if (!confirm(`Delete coach with ID ${id}?`)) {
     return;
   }
   this.startRequest();
   this.adminService.deleteCoach(id).subscribe({
     next: () => {
       this.success('Coach deleted successfully.');
       this.coachDeleteForm.reset({ id: 0 });
     },
     error: (error) => this.failure(error),
   });
 }
 // ========================================================================
 // SEAT
 // ========================================================================
 createSeat(): void {
   if (this.seatCreateForm.invalid) {
     this.seatCreateForm.markAllAsTouched();
     return;
   }
   this.startRequest();
   const value = this.seatCreateForm.value;
   const payload: SeatRequest = {
     seatNumber: value.seatNumber,
   };
   this.adminService
     .createSeat(Number(value.coachId), payload)
     .subscribe({
       next: () => {
         this.success('Seat created successfully.');
       },
       error: (error) => this.failure(error),
     });
 }
 updateSeat(): void {
   if (this.seatUpdateForm.invalid) {
     this.seatUpdateForm.markAllAsTouched();
     return;
   }
   this.startRequest();
   const value = this.seatUpdateForm.value;
   const payload: SeatAdminRequest = {
     coachId: Number(value.coachId),
     seatNumber: value.seatNumber,
   };
   this.adminService
     .updateSeat(Number(value.id), payload)
     .subscribe({
       next: () => {
         this.success('Seat updated successfully.');
       },
       error: (error) => this.failure(error),
     });
 }
 deleteSeat(): void {
   if (this.seatDeleteForm.invalid) {
     this.seatDeleteForm.markAllAsTouched();
     return;
   }
   const id = Number(this.seatDeleteForm.value.id);
   if (!confirm(`Delete seat with ID ${id}?`)) {
     return;
   }
   this.startRequest();
   this.adminService.deleteSeat(id).subscribe({
     next: () => {
       this.success('Seat deleted successfully.');
       this.seatDeleteForm.reset({ id: 0 });
     },
     error: (error) => this.failure(error),
   });
 }
 // ========================================================================
 // FARE
 // ========================================================================
 createFare(): void {
   if (this.fareCreateForm.invalid) {
     this.fareCreateForm.markAllAsTouched();
     return;
   }
   this.startRequest();
   const value = this.fareCreateForm.value;
   const payload: FareAdminRequest = {
     trainId: Number(value.trainId),
     fromStationId: Number(value.fromStationId),
     toStationId: Number(value.toStationId),
     coachType: Number(value.coachType) as any,
     amount: Number(value.amount),
   };
   this.adminService.createFare(payload).subscribe({
     next: () => {
       this.success('Fare created successfully.');
       this.fareCreateForm.reset({
         trainId: 0,
         fromStationId: 0,
         toStationId: 0,
         coachType: 0,
         amount: 0,
       });
     },
     error: (error) => this.failure(error),
   });
 }
 updateFare(): void {
   if (this.fareUpdateForm.invalid) {
     this.fareUpdateForm.markAllAsTouched();
     return;
   }
   this.startRequest();
   const value = this.fareUpdateForm.value;
   const payload: FareAdminRequest = {
     trainId: Number(value.trainId),
     fromStationId: Number(value.fromStationId),
     toStationId: Number(value.toStationId),
     coachType: Number(value.coachType) as any,
     amount: Number(value.amount),
   };
   this.adminService
     .updateFare(Number(value.id), payload)
     .subscribe({
       next: () => {
         this.success('Fare updated successfully.');
       },
       error: (error) => this.failure(error),
     });
 }
 deleteFare(): void {
   if (this.fareDeleteForm.invalid) {
     this.fareDeleteForm.markAllAsTouched();
     return;
   }
   const id = Number(this.fareDeleteForm.value.id);
   if (!confirm(`Delete fare with ID ${id}?`)) {
     return;
   }
   this.startRequest();
   this.adminService.deleteFare(id).subscribe({
     next: () => {
       this.success('Fare deleted successfully.');
       this.fareDeleteForm.reset({ id: 0 });
     },
     error: (error) => this.failure(error),
   });
 }
}
