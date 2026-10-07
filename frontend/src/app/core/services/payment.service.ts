import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { BookingRequest } from '../models/railway.models';

import { unwrapApiData } from '../utils/api-normalizer';

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

        map(

          (response) =>

            unwrapApiData<PaymentOtpResponse>(response) ??

            ({

              challengeId: '',

              maskedEmail: '',

              amount: 0,

              expiresInSeconds: 0,

            } as PaymentOtpResponse),

        ),

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

        map(

          (response) =>

            unwrapApiData<PaymentOtpVerificationResponse>(response) ??

            ({

              verificationToken: '',

              expiresInSeconds: 0,

            } as PaymentOtpVerificationResponse),

        ),

      );

  }

}
