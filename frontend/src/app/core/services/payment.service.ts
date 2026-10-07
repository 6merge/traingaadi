import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookingRequest } from '../models/railway.models';
export interface PaymentOtpResponse {
 challengeId: string;
 maskedEmail: string;
 amount: number;
 expiresInSeconds: number;
}
export interface PaymentOtpVerificationResponse {
 verificationToken: string;
 expiresInSeconds: number;
}
export interface PaymentOtpVerifyRequest {
 challengeId: string;
 otp: string;
 bookingRequest: BookingRequest;
}
@Injectable({
 providedIn: 'root',
})
export class PaymentService {
 constructor(private readonly http: HttpClient) {}
 requestOtp(
   bookingRequest: BookingRequest,
 ): Observable<PaymentOtpResponse> {
   return this.http
     .post<unknown>(
       `${environment.apiBaseUrl}/api/reservations/payment/otp/send`,
       bookingRequest,
     )
     .pipe(
       map((response: unknown) => {
         const raw = response as Record<string, unknown>;
         // Supports both:
         // { challengeId, maskedEmail, amount, expiresInSeconds }
         //
         // and possible ASP.NET/wrapper variants:
         // { ChallengeId, MaskedEmail, Amount, ExpiresInSeconds }
         //
         // and:
         // { data: { challengeId, ... } }
         const data =
           raw?.['data'] &&
           typeof raw['data'] === 'object'
             ? (raw['data'] as Record<string, unknown>)
             : raw;
         return {
           challengeId: String(
             data['challengeId'] ??
               data['ChallengeId'] ??
               '',
           ),
           maskedEmail: String(
             data['maskedEmail'] ??
               data['MaskedEmail'] ??
               '',
           ),
           amount: Number(
             data['amount'] ??
               data['Amount'] ??
               0,
           ),
           expiresInSeconds: Number(
             data['expiresInSeconds'] ??
               data['ExpiresInSeconds'] ??
               120,
           ),
         };
       }),
     );
 }
 verifyOtp(
   challengeId: string,
   otp: string,
   bookingRequest: BookingRequest,
 ): Observable<PaymentOtpVerificationResponse> {
   const request: PaymentOtpVerifyRequest = {
     challengeId,
     otp,
     bookingRequest,
   };
   return this.http
     .post<unknown>(
       `${environment.apiBaseUrl}/api/reservations/payment/otp/verify`,
       request,
     )
     .pipe(
       map((response: unknown) => {
         const raw = response as Record<string, unknown>;
         const data =
           raw?.['data'] &&
           typeof raw['data'] === 'object'
             ? (raw['data'] as Record<string, unknown>)
             : raw;
         return {
           verificationToken: String(
             data['verificationToken'] ??
               data['VerificationToken'] ??
               '',
           ),
           expiresInSeconds: Number(
             data['expiresInSeconds'] ??
               data['ExpiresInSeconds'] ??
               120,
           ),
         };
       }),
     );
 }
}
