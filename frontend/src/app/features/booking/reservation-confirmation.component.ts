import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
 BookingResponse,
 normalizeBookingStatus,
} from '../../core/models/railway.models';
@Component({
 selector: 'app-reservation-confirmation',
 standalone: true,
 imports: [CommonModule],
 template: `
<section class="confirmation-page" *ngIf="booking; else emptyState">
<!-- CONFIRMED -->
<div class="success-icon confirmed" *ngIf="isConfirmed">
       ✓
</div>
<!-- WAITLISTED -->
<div class="success-icon waiting" *ngIf="isWaitlisted">
       ⏳
</div>
<p class="eyebrow">
       {{ isConfirmed ? 'Ticket Confirmed' : 'Ticket Waitlisted' }}
</p>
<h1>
       Booking Successful!
</h1>
<p class="main-message" *ngIf="isConfirmed">
       Your railway ticket has been successfully booked and confirmed.
</p>
<p class="main-message" *ngIf="isWaitlisted">
       Your booking has been successfully completed and your ticket is
       currently on the waiting list.
</p>
<!-- PNR -->
<div class="details-card">
<div class="detail-row">
<span>PNR Number</span>
<strong>{{ booking.pnr }}</strong>
</div>
<div class="detail-row">
<span>Total Fare</span>
<strong>₹{{ booking.totalFare | number:'1.2-2' }}</strong>
</div>
<!-- Confirmed -->
<div class="status-box confirmed-box" *ngIf="isConfirmed">
<strong>✓ Ticket Confirmed</strong>
<span>Your seats have been allocated successfully.</span>
</div>
<!-- Waiting -->
<div class="status-box waiting-box" *ngIf="isWaitlisted">
<strong>⏳ Ticket Waiting List</strong>
<span *ngIf="booking.waitlistPosition">
           Your current waiting list position is
<b>WL {{ booking.waitlistPosition }}</b>.
</span>
<span *ngIf="!booking.waitlistPosition">
           Your ticket is currently waitlisted.
</span>
<small>
           You will receive an update if your ticket gets confirmed.
</small>
</div>
</div>
<!-- Passengers -->
<div class="passengers-card" *ngIf="booking.passengers?.length">
<h3>Passenger Details</h3>
<div
         class="passenger"
         *ngFor="let passenger of booking.passengers; let i = index"
>
<div>
<strong>{{ i + 1 }}. {{ passenger.name }}</strong>
</div>
<div *ngIf="isConfirmed && passenger.seatNumber">
           Seat: {{ passenger.seatNumber }}
</div>
<div *ngIf="isConfirmed && passenger.coachNumber">
           Coach: {{ passenger.coachNumber }}
</div>
<div *ngIf="isWaitlisted">
           Status: <strong>Waiting List</strong>
</div>
</div>
</div>
<button class="home-button" (click)="goHome()">
       Back to Home
</button>
</section>
<ng-template #emptyState>
<section class="confirmation-page">
<div class="success-icon waiting">!</div>
<h1>Booking information not found</h1>
<p>Please check your reservations to view your booking.</p>
<button class="home-button" (click)="goHome()">
         Back to Home
</button>
</section>
</ng-template>
 `,
 styles: [
   `
     :host {
       display: block;
     }
     .confirmation-page {
       max-width: 700px;
       margin: 3rem auto;
       padding: 2.5rem;
       background: white;
       border-radius: 24px;
       text-align: center;
       box-shadow: 0 10px 35px rgba(0,0,0,0.08);
     }
     .success-icon {
       width: 72px;
       height: 72px;
       margin: 0 auto 1rem;
       border-radius: 50%;
       display: flex;
       align-items: center;
       justify-content: center;
       font-size: 2rem;
       font-weight: 800;
     }
     .confirmed {
       background: #dcfce7;
       color: #15803d;
     }
     .waiting {
       background: #fef3c7;
       color: #b45309;
     }
     .eyebrow {
       margin: 0;
       font-size: .75rem;
       font-weight: 800;
       letter-spacing: .12em;
       text-transform: uppercase;
     }
     h1 {
       margin: .5rem 0;
       font-size: 2rem;
     }
     .main-message {
       color: #64748b;
       margin-bottom: 2rem;
     }
     .details-card {
       text-align: left;
       border: 1px solid #e2e8f0;
       border-radius: 16px;
       padding: 1.25rem;
     }
     .detail-row {
       display: flex;
       justify-content: space-between;
       padding: .8rem 0;
       border-bottom: 1px solid #e2e8f0;
     }
     .detail-row:last-of-type {
       border-bottom: none;
     }
     .status-box {
       margin-top: 1rem;
       padding: 1rem;
       border-radius: 12px;
       display: flex;
       flex-direction: column;
       gap: .35rem;
     }
     .confirmed-box {
       background: #f0fdf4;
       color: #166534;
       border: 1px solid #bbf7d0;
     }
     .waiting-box {
       background: #fffbeb;
       color: #92400e;
       border: 1px solid #fde68a;
     }
     .passengers-card {
       margin-top: 1.25rem;
       padding: 1.25rem;
       text-align: left;
       border: 1px solid #e2e8f0;
       border-radius: 16px;
     }
     .passenger {
       padding: .9rem 0;
       border-bottom: 1px solid #e2e8f0;
     }
     .passenger:last-child {
       border-bottom: none;
     }
     .home-button {
       margin-top: 1.5rem;
       padding: .85rem 1.5rem;
       border: none;
       border-radius: 10px;
       background: #0f766e;
       color: white;
       font-weight: 700;
       cursor: pointer;
     }
   `,
 ],
})
export class ReservationConfirmationComponent implements OnInit {
 booking: BookingResponse | null = null;
 isConfirmed = false;
 isWaitlisted = false;
 constructor(
   private readonly router: Router,
 ) {}
 ngOnInit(): void {
   const navigation = this.router.getCurrentNavigation();
   this.booking =
     navigation?.extras?.state?.['booking'] ??
     window.history.state?.booking ??
     null;
   if (!this.booking) {
     return;
   }
   const status = normalizeBookingStatus(this.booking.status);
   this.isConfirmed = status === 'Confirmed';
   this.isWaitlisted = status === 'Waitlisted';
   console.log('Booking confirmation:', this.booking);
 }
 goHome(): void {
   this.router.navigate(['/']);
 }
}
