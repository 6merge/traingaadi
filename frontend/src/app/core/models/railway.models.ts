export type CoachType = 'General' | 'Sleeper' | 'AC3Tier' | 'AC2Tier' | 'AC1Tier' | number;
export type QuotaType = 'General' | 'Ladies' | number;
export type Gender = 'Male' | 'Female' | number;
export type BookingStatus = 'Confirmed' | 'Waitlisted' | 'Cancelled';
export const COACH_TYPE_LABELS: Record<number, string> = {
 0: 'General',
 1: 'Sleeper',
 2: 'AC3Tier',
 3: 'AC2Tier',
 4: 'AC1Tier',
};
export const BOOKING_STATUS_LABELS: Record<number, string> = {
 0: 'Confirmed',
 1: 'Waitlisted',
 2: 'Cancelled',
};
export function normalizeCoachType(
 value: CoachType | number | string | null | undefined
): string {
 if (typeof value === 'number') {
   return COACH_TYPE_LABELS[value] ?? String(value);
 }
 if (typeof value === 'string') {
   return COACH_TYPE_LABELS[Number(value)] ?? value;
 }
 return 'General';
}
export function normalizeBookingStatus(
 value: BookingStatus | number | string | null | undefined
): BookingStatus {
 if (typeof value === 'number') {
   return (BOOKING_STATUS_LABELS[value] as BookingStatus) ?? 'Confirmed';
 }
 if (typeof value === 'string') {
   return (
     (BOOKING_STATUS_LABELS[Number(value)] as BookingStatus) ??
     (value as BookingStatus)
   );
 }
 return 'Confirmed';
}
export interface StationOption {
 id: number;
 code: string;
 name: string;
}
export const STATION_OPTIONS: StationOption[] = [
 { id: 1, code: 'ALP', name: 'Alpha Junction' },
 { id: 2, code: 'BRV', name: 'Bravo Central' },
 { id: 3, code: 'CRN', name: 'Charlie Town' },
 { id: 4, code: 'DLT', name: 'Delta City' },
 { id: 5, code: 'ECH', name: 'Echo Terminal' },
];
export interface RegisterRequest {
 name: string;
 email: string;
 phoneNumber: string;
 password: string;
}
export interface LoginRequest {
 email: string;
 password: string;
}
export interface LoginResponse {
 token: string;
 userId: number;
 role: string;
 expiresIn: number;
}
export interface UserResponse {
 id: number;
 name: string;
 email: string;
 phoneNumber: string;
 role: string;
}
export interface Train {
 id: number;
 trainNumber: string;
 name: string;
}
export interface RouteStop {
 id: number;
 stopOrder: number;
 stationId: number;
 stationCode: string;
 stationName: string;
 arrivalTime: string;
 departureTime: string;
}
export interface Fare {
 trainId: number;
 fromStationId: number;
 toStationId: number;
 coachType: CoachType;
 amount: number;
}
export interface BookingPassengerRequest {
 name: string;
 age: number;
 gender: Gender;
 address: string;
}
export interface BookingRequest {
 trainId: number;
 fromStationId: number;
 toStationId: number;
 journeyDate: string;
 coachType: CoachType;
 quota: QuotaType;
 passengers: BookingPassengerRequest[];
 paymentVerificationToken? :string | null;
}
export type ReservationRequest = BookingRequest;
export type Passenger = BookingPassengerRequest;
export interface BookingPassengerResponse {
 bookingPassengerId: number;
 name: string;
 coachNumber?: string | null;
 seatNumber?: string | null;
}
export interface BookingResponse {
 pnr?: string;
 pnrNumber?: string;
 status: BookingStatus;
 totalFare: number;
 passengers: BookingPassengerResponse[];
 waitlistPosition?: number | null;
}
export interface ReservationDetailsResponse extends BookingResponse {
 trainId: number;
 fromStationId: number;
 toStationId: number;
 journeyDate: string;
 coachType: CoachType;
 quota: QuotaType;
}
export interface StoredBookingSummary {
 pnr: string;
 trainId: number;
 fromStationId: number;
 toStationId: number;
 coachType: CoachType;
 status: BookingStatus;
 journeyDate: string;
 createdAt: string;
}
export interface AvailabilityResponse {
 availableSeats: number;
}
export interface FareAdminRequest {
 trainId: number;
 fromStationId: number;
 toStationId: number;
 coachType: CoachType;
 amount: number;
}
// -----------------------------------------------------------------------------
// Admin / Train Service DTOs
// -----------------------------------------------------------------------------
export interface TrainDto {
 id: number;
 trainNumber: string;
 name: string;
}
export interface StationDto {
 id: number;
 code: string;
 name: string;
}
export interface RouteStopDto {
 stopOrder: number;
 stationId: number;
 stationCode: string;
 stationName: string;
 arrivalTime: string;
 departureTime: string;
}
export interface SeatInventoryDto {
 coachId: number;
 coachNumber: string;
 seatId: number;
 seatNumber: string;
}
export interface TrainAdminRequest {
 trainNumber: string;
 name: string;
}
export interface StationAdminRequest {
 code: string;
 name: string;
}
export interface RouteStopRequest {
 stationId: number;
 stopOrder: number;
 arrivalTime: string;
 departureTime: string;
}
export interface RouteStopAdminRequest {
 trainId: number;
 stationId: number;
 stopOrder: number;
 arrivalTime: string;
 departureTime: string;
}
export interface CoachRequest {
 coachNumber: string;
 coachType: CoachType;
}
export interface CoachAdminRequest {
 trainId: number;
 coachNumber: string;
 coachType: CoachType;
}
export interface SeatRequest {
 seatNumber: string;
}
export interface SeatAdminRequest {
 coachId: number;
 seatNumber: string;}
