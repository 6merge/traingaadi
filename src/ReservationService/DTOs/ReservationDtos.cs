using ReservationService.Enums;

namespace ReservationService.DTOs;

public record BookingPassengerRequest(
    string Name,
    int Age,
    Gender Gender,
    string Address);

public record BookingRequest(
    int TrainId,
    int FromStationId,
    int ToStationId,
    DateTime JourneyDate,
    CoachType CoachType,
    QuotaType Quota,
    List<BookingPassengerRequest> Passengers,
    string? PaymentVerificationToken = null);

public record BookingPassengerResponse(
    int BookingPassengerId,
    string Name,
    string? CoachNumber,
    string? SeatNumber);

public record BookingResponse(
    string Pnr,
    BookingStatus Status,
    decimal TotalFare,
    List<BookingPassengerResponse> Passengers,
    int? WaitlistPosition);

public record ReservationDetailsResponse(
    string Pnr,
    BookingStatus Status,
    int TrainId,
    int FromStationId,
    int ToStationId,
    DateTime JourneyDate,
    CoachType CoachType,
    QuotaType Quota,
    decimal TotalFare,
    List<BookingPassengerResponse> Passengers,
    int? WaitlistPosition);

public record BookingSummaryResponse(
    string Pnr,
    int TrainId,
    int FromStationId,
    int ToStationId,
    DateTime JourneyDate,
    CoachType CoachType,
    BookingStatus Status,
    DateTime CreatedAt);

public record AvailabilityRequest(
    int TrainId,
    int FromStationId,
    int ToStationId,
    DateTime JourneyDate,
    CoachType CoachType);

public record PaymentOtpResponse(
   string ChallengeId,
   string MaskedEmail,
   decimal Amount,
   int ExpiresInSeconds);
public record PaymentOtpVerifyRequest(
   string ChallengeId,
   string Otp,
   BookingRequest BookingRequest);
public record PaymentOtpVerificationResponse(
   string VerificationToken,
   int ExpiresInSeconds);
public record AvailabilityResponse(int AvailableSeats);
