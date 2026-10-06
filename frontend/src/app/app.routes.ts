import { Routes } from '@angular/router';

import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { BookingComponent } from './features/booking/booking.component';
import { ReservationConfirmationComponent } from './features/booking/reservation-confirmation.component';
import { HomeComponent } from './features/home/home.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ReservationLookupComponent } from './features/reservation/reservation-lookup.component';
import { TrainDetailsComponent } from './features/trains/train-details.component';
import { TrainSearchComponent } from './features/trains/train-search.component';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'trains/search', component: TrainSearchComponent },
  { path: 'trains/:trainId', component: TrainDetailsComponent },
  { path: 'booking', component: BookingComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'reservation/lookup', component: ReservationLookupComponent },
  { path: 'reservation/confirmation', component: ReservationConfirmationComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' },
];
