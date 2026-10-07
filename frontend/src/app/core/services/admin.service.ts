import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
 CoachAdminRequest,
 CoachRequest,
 FareAdminRequest,
 RouteStopAdminRequest,
 RouteStopDto,
 RouteStopRequest,
 SeatAdminRequest,
 SeatRequest,
 StationAdminRequest,
 TrainAdminRequest,
 TrainDto,
} from '../models/railway.models';
@Injectable({
 providedIn: 'root',
})
export class AdminService {
 private readonly baseUrl = `${environment.apiBaseUrl}/api/admin`;
 constructor(private readonly http: HttpClient) {}
 // ---------------------------------------------------------------------------
 // TRAIN
 // ---------------------------------------------------------------------------
 createTrain(payload: TrainAdminRequest): Observable<TrainDto> {
   return this.http.post<TrainDto>(
     `${this.baseUrl}/trains`,
     payload
   );
 }
 updateTrain(
   trainId: number,
   payload: TrainAdminRequest
 ): Observable<TrainDto> {
   return this.http.put<TrainDto>(
     `${this.baseUrl}/trains/${trainId}`,
     payload
   );
 }
 deleteTrain(trainId: number): Observable<void> {
   return this.http.delete<void>(
     `${this.baseUrl}/trains/${trainId}`
   );
 }
 // ---------------------------------------------------------------------------
 // STATION
 // ---------------------------------------------------------------------------
 createStation(
   payload: StationAdminRequest
 ): Observable<void> {
   return this.http.post<void>(
     `${this.baseUrl}/stations`,
     payload
   );
 }
 updateStation(
   stationId: number,
   payload: StationAdminRequest
 ): Observable<void> {
   return this.http.put<void>(
     `${this.baseUrl}/stations/${stationId}`,
     payload
   );
 }
 deleteStation(stationId: number): Observable<void> {
   return this.http.delete<void>(
     `${this.baseUrl}/stations/${stationId}`
   );
 }
 // ---------------------------------------------------------------------------
 // ROUTE STOPS
 // ---------------------------------------------------------------------------
 createRouteStop(
   trainId: number,
   payload: RouteStopRequest
 ): Observable<void> {
   return this.http.post<void>(
     `${this.baseUrl}/trains/${trainId}/route-stops`,
     payload
   );
 }
 getRouteStops(
   trainId: number
 ): Observable<RouteStopDto[]> {
   return this.http.get<RouteStopDto[]>(
     `${this.baseUrl}/trains/${trainId}/route-stops`
   );
 }
 updateRouteStop(
   routeStopId: number,
   payload: RouteStopAdminRequest
 ): Observable<void> {
   return this.http.put<void>(
     `${this.baseUrl}/route-stops/${routeStopId}`,
     payload
   );
 }
 deleteRouteStop(
   routeStopId: number
 ): Observable<void> {
   return this.http.delete<void>(
     `${this.baseUrl}/route-stops/${routeStopId}`
   );
 }
 // ---------------------------------------------------------------------------
 // COACH
 // ---------------------------------------------------------------------------
 createCoach(
   trainId: number,
   payload: CoachRequest
 ): Observable<void> {
   return this.http.post<void>(
     `${this.baseUrl}/trains/${trainId}/coaches`,
     payload
   );
 }
 updateCoach(
   coachId: number,
   payload: CoachAdminRequest
 ): Observable<void> {
   return this.http.put<void>(
     `${this.baseUrl}/coaches/${coachId}`,
     payload
   );
 }
 deleteCoach(coachId: number): Observable<void> {
   return this.http.delete<void>(
     `${this.baseUrl}/coaches/${coachId}`
   );
 }
 // ---------------------------------------------------------------------------
 // SEAT
 // ---------------------------------------------------------------------------
 createSeat(
   coachId: number,
   payload: SeatRequest
 ): Observable<void> {
   return this.http.post<void>(
     `${this.baseUrl}/coaches/${coachId}/seats`,
     payload
   );
 }
 updateSeat(
   seatId: number,
   payload: SeatAdminRequest
 ): Observable<void> {
   return this.http.put<void>(
     `${this.baseUrl}/seats/${seatId}`,
     payload
   );
 }
 deleteSeat(seatId: number): Observable<void> {
   return this.http.delete<void>(
     `${this.baseUrl}/seats/${seatId}`
   );
 }
 // ---------------------------------------------------------------------------
 // FARE
 // ---------------------------------------------------------------------------
 createFare(
   payload: FareAdminRequest
 ): Observable<void> {
   return this.http.post<void>(
     `${this.baseUrl}/fares`,
     payload
   );
 }
 updateFare(
   fareId: number,
   payload: FareAdminRequest
 ): Observable<void> {
   return this.http.put<void>(
     `${this.baseUrl}/fares/${fareId}`,
     payload
   );
 }
 deleteFare(fareId: number): Observable<void> {
   return this.http.delete<void>(
     `${this.baseUrl}/fares/${fareId}`
   );
 }
}
