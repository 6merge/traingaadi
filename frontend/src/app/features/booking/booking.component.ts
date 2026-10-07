import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
 FormArray,
 FormBuilder,
 FormGroup,
 ReactiveFormsModule,
 Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
 BookingRequest,
 CoachType,
 Gender,
 QuotaType,
 STATION_OPTIONS,
} from '../../core/models/railway.models';
import { PaymentService } from '../../core/services/payment.service';
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
<div class="error-box" *ngIf="errorMessage">
     {{ errorMessage }}
</div>
<form
     class="booking-form"
     [formGroup]="form"
     (ngSubmit)="onSubmit()"
>
<div class="field-grid">
<label>
<span>Train</span>
<select formControlName="trainId">
<option [ngValue]="0" disabled>Select a train</option>
<option
             *ngFor="let train of trainOptions"
             [ngValue]="train.id"
>
             {{ train.code }} · {{ train.name }}
</option>
</select>
</label>
<label>
<span>From station</span>
<select formControlName="fromStationId">
<option [ngValue]="0" disabled>Select origin</option>
<option
             *ngFor="let station of stationOptions"
             [ngValue]="station.id"
>
             {{ station.code }} · {{ station.name }}
</option>
</select>
</label>
<label>
<span>To station</span>
<select formControlName="toStationId">
<option [ngValue]="0" disabled>Select destination</option>
<option
             *ngFor="let station of stationOptions"
             [ngValue]="station.id"
>
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
<div
           *ngFor="
             let passenger of passengers.controls;
             let i = index
           "
           [formGroupName]="i"
           class="passenger-card"
>
<div class="passenger-header">
<strong>Passenger {{ i + 1 }}</strong>
<button
               type="button"
               class="remove-btn"
               *ngIf="i > 0"
               (click)="removePassenger(i)"
>
               Remove
</button>
</div>
<div class="field-grid small-grid">
<label>
<span>Name</span>
<input type="text" formControlName="name" />
</label>
<label>
<span>Age</span>
<input
                 type="number"
                 formControlName="age"
                 min="1"
               />
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
<button
         type="button"
         class="secondary"
         (click)="addPassenger()"
>
         Add passenger
</button>
</div>
<button
       type="submit"
       class="submit"
       [disabled]="form.invalid || isSubmitting"
>
       {{ isSubmitting ? 'Preparing payment...' : 'Confirm Booking' }}
</button>
</form>
<!-- Dummy Payment Gateway -->
<div
     class="modal-backdrop"
     *ngIf="showPaymentGateway"
>
<div
       class="payment-modal"
       role="dialog"
       aria-modal="true"
       aria-labelledby="payment-title"
>
<div class="payment-header">
<div>
<p class="payment-eyebrow">Secure payment</p>
<h2 id="payment-title">
             Dummy Payment Gateway
</h2>
</div>
<button
           type="button"
           class="close-btn"
           (click)="closePaymentGateway()"
           [disabled]="isProcessingPayment"
>
           ×
</button>
</div>
<div class="amount-card">
<span>Total ticket amount</span>
<strong>
           ₹{{ paymentAmount | number: '1.2-2' }}
</strong>
</div>
<div
         class="loading-card"
         *ngIf="isPreparingPayment"
>
<div class="spinner"></div>
<div>
<strong>Preparing your payment</strong>
<p>
             Sending a verification OTP to your registered email...
</p>
</div>
</div>
<ng-container *ngIf="!isPreparingPayment">
<div class="success-card">
<strong>OTP sent successfully</strong>
<p>
             We sent a 6-digit OTP to
<strong>{{ maskedEmail }}</strong>.
</p>
</div>
<label class="otp-label">
<span>Enter OTP</span>
<input
             type="text"
             inputmode="numeric"
             maxlength="6"
             autocomplete="one-time-code"
             [value]="enteredOtp"
             (input)="onOtpInput($event)"
             placeholder="Enter 6-digit OTP"
             [disabled]="isProcessingPayment"
           />
</label>
<div class="otp-meta">
<span
             [class.expired]="remainingOtpSeconds <= 0"
>
             {{
               remainingOtpSeconds > 0
                 ? 'OTP expires in ' + formatCountdown()
                 : 'OTP expired'
             }}
</span>
<button
             type="button"
             class="resend-btn"
             (click)="resendOtp()"
             [disabled]="
               isProcessingPayment ||
               isResendingOtp
             "
>
             {{
               isResendingOtp
                 ? 'Sending...'
                 : 'Resend OTP'
             }}
</button>
</div>
<div
           class="payment-error"
           *ngIf="paymentError"
>
           {{ paymentError }}
</div>
<button
           type="button"
           class="pay-btn"
           (click)="verifyAndPay()"
           [disabled]="
             enteredOtp.length !== 6 ||
             isProcessingPayment ||
             remainingOtpSeconds <= 0
           "
>
           {{
             isProcessingPayment
               ? 'Verifying...'
               : 'Verify OTP & Pay'
           }}
</button>
<p class="demo-note">
           This is a dummy payment gateway.
           No card, CVV, expiry, UPI or bank details
           are required.
</p>
</ng-container>
</div>
</div>
 `,
 styles: [
   `
     :host {
       display: block;
     }
     .page-header {
       margin: 1rem 0 1.2rem;
     }
     .eyebrow,
     .payment-eyebrow {
       margin: 0;
       font-size: 0.72rem;
       font-weight: 700;
       letter-spacing: 0.12em;
       text-transform: uppercase;
       color: #0f766e;
     }
     h1 {
       margin: 0.4rem 0 0;
     }
     .booking-form {
       background: white;
       border: 1px solid #e2e8f0;
       border-radius: 20px;
       padding: 1.3rem;
     }
     .field-grid {
       display: grid;
       grid-template-columns: repeat(2, minmax(0, 1fr));
       gap: 1rem;
     }
     .small-grid {
       grid-template-columns: repeat(2, minmax(0, 1fr));
     }
     .full-width {
       grid-column: 1 / -1;
     }
     label {
       display: block;
       color: #334155;
     }
     label span {
       display: block;
       margin-bottom: 0.35rem;
     }
     input,
     select {
       width: 100%;
       box-sizing: border-box;
       padding: 0.85rem 1rem;
       border: 1px solid #cbd5e1;
       border-radius: 12px;
       font: inherit;
     }
     .passenger-section {
       margin-top: 1.5rem;
     }
     .passenger-row {
       display: grid;
       gap: 1rem;
     }
     .passenger-card {
       border: 1px solid #e2e8f0;
       border-radius: 16px;
       padding: 1rem;
       background: #f8fafc;
     }
     .passenger-header {
       display: flex;
       justify-content: space-between;
       margin-bottom: 0.9rem;
     }
     .remove-btn,
     .secondary {
       border: 1px solid #cbd5e1;
       background: white;
       color: #0f172a;
       border-radius: 10px;
       padding: 0.6rem 0.8rem;
       cursor: pointer;
     }
     .submit {
       margin-top: 1.5rem;
       background: #0f172a;
       color: white;
       border: none;
       border-radius: 12px;
       padding: 0.95rem 1.2rem;
       font-weight: 700;
       cursor: pointer;
       width: 100%;
     }
     .submit:disabled {
       opacity: 0.7;
       cursor: not-allowed;
     }
     .error-box {
       color: #b91c1c;
       background: #fef2f2;
       border: 1px solid #fecaca;
       border-radius: 12px;
       padding: 0.8rem 1rem;
       margin-bottom: 1rem;
     }
     /* Payment modal */
     .modal-backdrop {
       position: fixed;
       inset: 0;
       z-index: 1000;
       display: flex;
       align-items: center;
       justify-content: center;
       padding: 1rem;
       background: rgba(15, 23, 42, 0.62);
       backdrop-filter: blur(4px);
     }
     .payment-modal {
       width: min(100%, 460px);
       max-height: calc(100vh - 2rem);
       overflow-y: auto;
       background: white;
       border-radius: 22px;
       padding: 1.4rem;
       box-shadow: 0 25px 70px rgba(15, 23, 42, 0.3);
     }
     .payment-header {
       display: flex;
       align-items: flex-start;
       justify-content: space-between;
       gap: 1rem;
     }
     .payment-header h2 {
       margin: 0.35rem 0 0;
     }
     .close-btn {
       width: 36px;
       height: 36px;
       border: 1px solid #e2e8f0;
       background: white;
       border-radius: 50%;
       font-size: 1.4rem;
       line-height: 1;
       cursor: pointer;
     }
     .amount-card {
       margin-top: 1.2rem;
       padding: 1rem;
       border-radius: 16px;
       background: #f8fafc;
       border: 1px solid #e2e8f0;
       display: flex;
       align-items: center;
       justify-content: space-between;
       gap: 1rem;
     }
     .amount-card span {
       color: #64748b;
     }
     .amount-card strong {
       font-size: 1.35rem;
       color: #0f172a;
     }
     .loading-card,
     .success-card {
       display: flex;
       gap: 0.8rem;
       align-items: flex-start;
       margin-top: 1rem;
       padding: 1rem;
       border-radius: 14px;
       background: #f0fdfa;
       border: 1px solid #99f6e4;
     }
     .loading-card p,
     .success-card p {
       margin: 0.35rem 0 0;
       color: #475569;
       font-size: 0.9rem;
     }
     .spinner {
       width: 20px;
       height: 20px;
       flex: 0 0 20px;
       border: 3px solid #ccfbf1;
       border-top-color: #0f766e;
       border-radius: 50%;
       animation: spin 0.8s linear infinite;
     }
     @keyframes spin {
       to {
         transform: rotate(360deg);
       }
     }
     .otp-label {
       margin-top: 1.2rem;
     }
     .otp-label input {
       margin-top: 0.3rem;
       font-size: 1.25rem;
       letter-spacing: 0.3em;
       text-align: center;
     }
     .otp-meta {
       display: flex;
       justify-content: space-between;
       align-items: center;
       gap: 1rem;
       margin-top: 0.7rem;
       color: #64748b;
       font-size: 0.85rem;
     }
     .otp-meta .expired {
       color: #b91c1c;
     }
     .resend-btn {
       border: none;
       background: transparent;
       color: #0f766e;
       font-weight: 700;
       cursor: pointer;
     }
     .resend-btn:disabled {
       opacity: 0.5;
       cursor: not-allowed;
     }
     .payment-error {
       margin-top: 1rem;
       padding: 0.75rem 0.9rem;
       border-radius: 10px;
       color: #b91c1c;
       background: #fef2f2;
       border: 1px solid #fecaca;
       font-size: 0.9rem;
     }
     .pay-btn {
       width: 100%;
       margin-top: 1.2rem;
       padding: 0.95rem 1rem;
       border: none;
       border-radius: 12px;
       background: #0f172a;
       color: white;
       font-weight: 700;
       cursor: pointer;
     }
     .pay-btn:disabled {
       opacity: 0.55;
       cursor: not-allowed;
     }
     .demo-note {
       margin: 1rem 0 0;
       text-align: center;
       color: #64748b;
       font-size: 0.78rem;
       line-height: 1.5;
     }
     @media (max-width: 760px) {
       .field-grid,
       .small-grid {
         grid-template-columns: 1fr;
       }
     }
   `,
 ],
})
export class BookingComponent implements OnInit, OnDestroy {
 readonly stationOptions = STATION_OPTIONS;
 readonly trainOptions = [
   {
     id: 1,
     code: '12001',
     name: 'Northern Express',
   },
   {
     id: 2,
     code: '12002',
     name: 'Southern Express',
   },
 ];
 isSubmitting = false;
 errorMessage = '';
 showPaymentGateway = false;
 isPreparingPayment = false;
 isProcessingPayment = false;
 isResendingOtp = false;
 paymentAmount = 0;
 maskedEmail = '';
 challengeId = '';
 enteredOtp = '';
 paymentError = '';
 remainingOtpSeconds = 0;
 private paymentPayload: BookingRequest | null = null;
 private otpTimer: ReturnType<typeof setInterval> | null = null;
 private querySubscription?: Subscription;
 readonly form: FormGroup;
 constructor(
   private readonly fb: FormBuilder,
   private readonly reservationService: ReservationService,
   private readonly paymentService: PaymentService,
   private readonly route: ActivatedRoute,
   private readonly router: Router,
 ) {
   this.form = this.fb.nonNullable.group({
     trainId: [0, [Validators.required, Validators.min(1)]],
     fromStationId: [0, [Validators.required, Validators.min(1)]],
     toStationId: [0, [Validators.required, Validators.min(1)]],
     journeyDate: [
       this.todayString(),
       [Validators.required],
     ],
     coachType: ['General', Validators.required],
     quota: ['General', Validators.required],
     passengers: this.fb.nonNullable.array([
       this.createPassenger(),
     ]),
   });
 }
 get passengers(): FormArray {
   return this.form.get('passengers') as FormArray;
 }
 ngOnInit(): void {
   this.querySubscription =
     this.route.queryParamMap.subscribe((params) => {
       const trainId = Number(
         params.get('trainId') ?? 0,
       );
       const fromStationId = Number(
         params.get('fromStationId') ?? 0,
       );
       const toStationId = Number(
         params.get('toStationId') ?? 0,
       );
       const coachType =
         params.get('coachType') ?? 'General';
       const quota =
         params.get('quota') ?? 'General';
       const journeyDate =
         params.get('journeyDate') ??
         this.todayString();
       if (trainId) {
         this.form.patchValue({
           trainId,
           fromStationId,
           toStationId,
           journeyDate,
           coachType,
           quota,
         });
       }
     });
 }
 ngOnDestroy(): void {
   this.stopOtpTimer();
   this.querySubscription?.unsubscribe();
 }
 addPassenger(): void {
   if (this.passengers.length < 6) {
     this.passengers.push(this.createPassenger());
   }
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
   const payload = this.buildBookingPayload();
   this.paymentPayload = payload;
   this.errorMessage = '';
   this.paymentError = '';
   /*
    * IMPORTANT:
    * Open the gateway FIRST.
    *
    * This fixes the previous issue where the popup
    * appeared only after the HTTP request completed.
    */
   this.showPaymentGateway = true;
   this.isPreparingPayment = true;
   this.isProcessingPayment = false;
   this.isSubmitting = true;
   this.paymentAmount = 0;
   this.maskedEmail = '';
   this.challengeId = '';
   this.enteredOtp = '';
   this.stopOtpTimer();
   this.requestOtp(payload);
 }
 private requestOtp(payload: BookingRequest): void {
   this.isPreparingPayment = true;
   this.paymentError = '';
   this.paymentService.requestOtp(payload).subscribe({
     next: (response) => {
       if (!response.challengeId) {
         this.paymentError =
           'The payment gateway could not start the OTP verification.';
         this.isPreparingPayment = false;
         return;
       }
       this.challengeId = response.challengeId;
       this.maskedEmail = response.maskedEmail;
       this.paymentAmount = Number(response.amount ?? 0);
       this.remainingOtpSeconds =
         Number(response.expiresInSeconds ?? 0);
       this.enteredOtp = '';
       this.isPreparingPayment = false;
       this.startOtpTimer();
     },
     error: (error: Error) => {
       this.isPreparingPayment = false;
       this.paymentError =
         error.message ||
         'Unable to send the payment OTP.';
     },
   });
 }
 resendOtp(): void {
   if (!this.paymentPayload || this.isResendingOtp) {
     return;
   }
   this.isResendingOtp = true;
   this.paymentError = '';
   this.enteredOtp = '';
   this.stopOtpTimer();
   this.paymentService
     .requestOtp(this.paymentPayload)
     .subscribe({
       next: (response) => {
         this.challengeId = response.challengeId;
         this.maskedEmail = response.maskedEmail;
         this.paymentAmount = Number(
           response.amount ?? 0,
         );
         this.remainingOtpSeconds =
           Number(response.expiresInSeconds ?? 0);
         this.isResendingOtp = false;
         this.startOtpTimer();
       },
       error: (error: Error) => {
         this.isResendingOtp = false;
         this.paymentError =
           error.message ||
           'Unable to resend the OTP.';
       },
     });
 }
 verifyAndPay(): void {
   if (!this.paymentPayload) {
     this.paymentError =
       'Booking information is missing.';
     return;
   }
   if (!this.challengeId) {
     this.paymentError =
       'Please request a new OTP.';
     return;
   }
   if (this.remainingOtpSeconds <= 0) {
     this.paymentError =
       'OTP has expired. Please request a new OTP.';
     return;
   }
   if (this.enteredOtp.length !== 6) {
     this.paymentError =
       'Enter the complete 6-digit OTP.';
     return;
   }
   this.isProcessingPayment = true;
   this.paymentError = '';
   this.paymentService
     .verifyOtp(
       this.challengeId,
       this.enteredOtp,
       this.paymentPayload,
     )
     .subscribe({
       next: (response) => {
         if (!response.verificationToken) {
           this.isProcessingPayment = false;
           this.paymentError =
             'Payment verification failed.';
           return;
         }
         const verifiedPayload: BookingRequest = {
           ...this.paymentPayload!,
           paymentVerificationToken:
             response.verificationToken,
         };
         this.submitReservation(
           verifiedPayload,
         );
       },
       error: (error: Error) => {
         this.isProcessingPayment = false;
         this.paymentError =
           error.message ||
           'Incorrect or expired OTP.';
       },
     });
 }
 private submitReservation(
   payload: BookingRequest,
 ): void {
   this.reservationService
     .createReservation(payload)
     .subscribe({
       next: (result) => {
         const pnr =
           result.pnr ??
           result.pnrNumber ??
           '';
         if (pnr) {
           this.reservationService.saveBookingSummary({
             pnr,
             trainId: payload.trainId,
             fromStationId:
               payload.fromStationId,
             toStationId:
               payload.toStationId,
             coachType: payload.coachType,
             status:
               result.status ?? 'Confirmed',
             journeyDate:
               payload.journeyDate,
             createdAt:
               new Date().toISOString(),
           });
         }
         this.stopOtpTimer();
         this.showPaymentGateway = false;
         this.isProcessingPayment = false;
         this.isSubmitting = false;
         this.router.navigate(
           ['/reservation/confirmation'],
           {
             queryParams: { pnr },
           },
         );
       },
       error: (error: Error) => {
         this.isProcessingPayment = false;
         this.isSubmitting = false;
         this.paymentError =
           error.message ||
           'Booking could not be completed.';
       },
     });
 }
 closePaymentGateway(): void {
   if (
     this.isProcessingPayment ||
     this.isPreparingPayment
   ) {
     return;
   }
   this.stopOtpTimer();
   this.showPaymentGateway = false;
   this.isSubmitting = false;
   this.paymentPayload = null;
   this.challengeId = '';
   this.enteredOtp = '';
   this.paymentError = '';
 }
 onOtpInput(event: Event): void {
   const input =
     event.target as HTMLInputElement;
   this.enteredOtp =
     input.value.replace(/\D/g, '').slice(0, 6);
   input.value = this.enteredOtp;
 }
 formatCountdown(): string {
   const minutes = Math.floor(
     this.remainingOtpSeconds / 60,
   );
   const seconds =
     this.remainingOtpSeconds % 60;
   return `${String(minutes).padStart(2, '0')}:${String(
     seconds,
   ).padStart(2, '0')}`;
 }
 private startOtpTimer(): void {
   this.stopOtpTimer();
   this.otpTimer = setInterval(() => {
     if (this.remainingOtpSeconds <= 0) {
       this.stopOtpTimer();
       return;
     }
     this.remainingOtpSeconds--;
   }, 1000);
 }
 private stopOtpTimer(): void {
   if (this.otpTimer !== null) {
     clearInterval(this.otpTimer);
     this.otpTimer = null;
   }
 }
 private buildBookingPayload(): BookingRequest {
   const coachType =
     (this.form.get('coachType')?.value ??
       'General') as CoachType;
   const quota =
     (this.form.get('quota')?.value ??
       'General') as QuotaType;
   return {
     trainId: Number(
       this.form.get('trainId')?.value ?? 0,
     ),
     fromStationId: Number(
       this.form.get('fromStationId')?.value ?? 0,
     ),
     toStationId: Number(
       this.form.get('toStationId')?.value ?? 0,
     ),
     journeyDate:
       this.form.get('journeyDate')?.value ??
       this.todayString(),
     coachType: this.toEnumNumber(
       coachType,
       {
         General: 0,
         Sleeper: 1,
         AC3Tier: 2,
         AC2Tier: 3,
         AC1Tier: 4,
       },
     ),
     quota: this.toEnumNumber(
       quota,
       {
         General: 0,
         Ladies: 1,
       },
     ),
     passengers:
       this.passengers.value.map(
         (passenger: Record<string, unknown>) => ({
           name: String(
             passenger?.['name'] ?? '',
           ),
           age: Number(
             passenger?.['age'] ?? 0,
           ),
           gender: this.toEnumNumber(
             (passenger?.['gender'] ??
               'Male') as Gender,
             {
               Male: 0,
               Female: 1,
             },
           ),
           address: String(
             passenger?.['address'] ?? 'N/A',
           ),
         }),
       ),
   };
 }
 private createPassenger(): FormGroup {
   return this.fb.nonNullable.group({
     name: ['', Validators.required],
     age: [
       18,
       [
         Validators.required,
         Validators.min(1),
       ],
     ],
     gender: ['Male', Validators.required],
     address: [
       'N/A',
       Validators.required,
     ],
   });
 }
 private toEnumNumber<T extends string | number>(
   value: T,
   map: Record<string, number>,
 ): number {
   if (typeof value === 'number') {
     return value;
   }
   const key = String(value);
   const mapped = map[key];
   if (mapped !== undefined) {
     return mapped;
   }
   const numericValue = Number(key);
   return Number.isFinite(numericValue)
     ? numericValue
     : 0;
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
