import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { FareAdminRequest, TrainAdminRequest } from '../models/railway.models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private readonly http: HttpClient) {}

  createTrain(payload: TrainAdminRequest): Observable<{ id: number; trainNumber: string; name: string }> {
    return this.http.post<{ id: number; trainNumber: string; name: string }>(`${environment.apiBaseUrl}/api/admin/trains`, payload);
  }

  createFare(payload: FareAdminRequest): Observable<unknown> {
    return this.http.post<unknown>(`${environment.apiBaseUrl}/api/admin/fares`, payload);
  }
}
