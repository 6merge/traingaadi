import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {finalize} from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AvailabilityResponse,
  BookingRequest,
  BookingResponse,
  BookingStatus,
  CoachType,
  ReservationDetailsResponse,
  StoredBookingSummary,
  normalizeBookingStatus,
  normalizeCoachType,
} from '../models/railway.models';
import { unwrapApiData } from '../utils/api-normalizer';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly bookingStorageKey = 'railway_saved_bookings';

  constructor(private readonly http: HttpClient) {}

  saveBookingSummary(summary: StoredBookingSummary): void {
    const current = this.getStoredBookings();
    const updated = [summary, ...current.filter((item) => item.pnr !== summary.pnr)].slice(0, 10);
    sessionStorage.setItem(this.bookingStorageKey, JSON.stringify(updated));
  }

  getStoredBookings(): StoredBookingSummary[] {
    const raw = sessionStorage.getItem(this.bookingStorageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as StoredBookingSummary[] | null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  clearStoredBookings(): void {
    sessionStorage.removeItem(this.bookingStorageKey);
  }

  getAvailability(
    trainId: number,
    fromStationId: number,
    toStationId: number,
    journeyDate: string,
    coachType: CoachType,
  ): Observable<AvailabilityResponse> {
    const params = new HttpParams()
      .set('trainId', trainId)
      .set('fromStationId', fromStationId)
      .set('toStationId', toStationId)
      .set('journeyDate', journeyDate)
      .set('coachType', coachType);

    return this.http
      .get<unknown>(`${environment.apiBaseUrl}/api/reservations/availability`, { params })
      .pipe(map((response) => unwrapApiData<AvailabilityResponse>(response) ?? ({ availableSeats: 0 } as AvailabilityResponse)));
  }

  createReservation(payload: BookingRequest): Observable<BookingResponse> {
    return this.http
      .post<unknown>(`${environment.apiBaseUrl}/api/reservations`, payload)
      .pipe(map((response) => unwrapApiData<BookingResponse>(response) ?? ({ status: 'Confirmed', totalFare: 0, passengers: [] } as BookingResponse)));
  }

  createBooking(payload: BookingRequest): Observable<BookingResponse> {
    return this.createReservation(payload);
  }

  getMyBookings(): Observable<StoredBookingSummary[]> {
    return this.http.get<unknown>(`${environment.apiBaseUrl}/api/reservations`).pipe(
      map((response) => {
        const values = unwrapApiData<StoredBookingSummary[]>(response) ?? [];
        return (Array.isArray(values) ? values : []).map((booking) => ({
          pnr: booking.pnr,
          trainId: Number(booking.trainId ?? 0),
          fromStationId: Number(booking.fromStationId ?? 0),
          toStationId: Number(booking.toStationId ?? 0),
          coachType: normalizeCoachType(booking.coachType) as CoachType,
          status: normalizeBookingStatus(booking.status) as BookingStatus,
          journeyDate: booking.journeyDate ?? '',
          createdAt: booking.createdAt ?? new Date().toISOString(),
        }));
      }),
    );
  }

  getReservationByPnr(pnr: string): Observable<ReservationDetailsResponse> {
    return this.http
      .get<unknown>(`${environment.apiBaseUrl}/api/reservations/${encodeURIComponent(pnr)}`)
      .pipe(
        map(
          (response) =>
            unwrapApiData<ReservationDetailsResponse>(response) ??
            ({
              status: 'Confirmed',
              totalFare: 0,
              passengers: [],
              trainId: 0,
              fromStationId: 0,
              toStationId: 0,
              journeyDate: '',
              coachType: 'General',
              quota: 'General',
            } as ReservationDetailsResponse),
        ),
      );
  }

  getBooking(pnr: string): Observable<ReservationDetailsResponse> {
    return this.getReservationByPnr(pnr);
  }

  saveBookingFromDetails(details: ReservationDetailsResponse): void {
    const pnr = details?.pnr ?? details?.pnrNumber ?? '';
    if (!pnr) {
      return;
    }

    this.saveBookingSummary({
      pnr,
      trainId: details.trainId,
      fromStationId: details.fromStationId,
      toStationId: details.toStationId,
      coachType: normalizeCoachType(details.coachType) as CoachType,
      status: normalizeBookingStatus(details.status) as BookingStatus,
      journeyDate: details.journeyDate,
      createdAt: new Date().toISOString(),
    });
  }

  cancelReservation(pnr: string): Observable<BookingResponse> {
    return this.http
      .post<unknown>(`${environment.apiBaseUrl}/api/reservations/${encodeURIComponent(pnr)}/cancel`, {})
      .pipe(map((response) => unwrapApiData<BookingResponse>(response) ?? ({ status: 'Cancelled', totalFare: 0, passengers: [] } as BookingResponse)));
  }

  cancelBooking(pnr: string): Observable<BookingResponse> {
    return this.cancelReservation(pnr);
  }
}
