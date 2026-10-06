import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CoachType, Fare, RouteStop, Train } from '../models/railway.models';
import { unwrapApiData, unwrapArrayData } from '../utils/api-normalizer';

@Injectable({
  providedIn: 'root',
})
export class TrainService {
  constructor(private readonly http: HttpClient) {}

  searchTrains(fromStationId: number, toStationId: number): Observable<Train[]> {
    const params = new HttpParams().set('fromStationId', fromStationId).set('toStationId', toStationId);
    return this.http
      .get<unknown>(`${environment.apiBaseUrl}/api/trains/search`, { params })
      .pipe(
        map((response) => {
          const normalized = Array.isArray(response) ? response : unwrapArrayData<Train>(response);
          return Array.isArray(normalized) ? normalized.filter((train) => !!train && typeof train === 'object') : [];
        }),
      );
  }

  getTrain(trainId: number): Observable<Train> {
    return this.http
      .get<unknown>(`${environment.apiBaseUrl}/api/trains/${trainId}`)
      .pipe(map((response) => unwrapApiData<Train>(response) ?? ({ id: 0, trainNumber: '', name: '' } as Train)));
  }

  getRoute(trainId: number): Observable<RouteStop[]> {
    return this.http
      .get<unknown>(`${environment.apiBaseUrl}/api/trains/${trainId}/route`)
      .pipe(map((response) => unwrapArrayData<RouteStop>(response)));
  }

  getFare(trainId: number, fromStationId: number, toStationId: number, coachType: CoachType): Observable<Fare> {
    const params = new HttpParams()
      .set('trainId', trainId)
      .set('fromStationId', fromStationId)
      .set('toStationId', toStationId)
      .set('coachType', coachType);

    return this.http
      .get<unknown>(`${environment.apiBaseUrl}/api/trains/${trainId}/fare`, { params })
      .pipe(map((response) => unwrapApiData<Fare>(response) ?? ({ trainId, fromStationId, toStationId, coachType, amount: 0 } as Fare)));
  }
}
