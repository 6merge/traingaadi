using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ReservationService.Clients;
using ReservationService.DTOs;
using ReservationService.Enums;
namespace ReservationService.Services;
public sealed class PaymentOtpService(
   IUserClient userClient,
   ITrainClient trainClient,
   IMailClient mailClient) : IPaymentOtpService
{
   private const int OtpValidityMinutes = 2;
   private const int MaximumAttempts = 5;
   private static readonly ConcurrentDictionary<string, OtpChallenge> Challenges = new();
   private static readonly ConcurrentDictionary<string, VerifiedPayment> VerifiedPayments = new();
   public async Task<PaymentOtpResponse> SendOtpAsync(
       int userId,
       BookingRequest request)
   {
       ValidateRequest(userId, request);
       CleanupExpiredEntries();
       var user = await userClient.GetUserAsync(userId)
           ?? throw new InvalidOperationException("User was not found.");
       if (string.IsNullOrWhiteSpace(user.Email))
       {
           throw new InvalidOperationException(
               "The registered email address is not available.");
       }
       var route = await trainClient.GetRouteAsync(request.TrainId);
       var fromStop = route.FirstOrDefault(
           stop => stop.StationId == request.FromStationId);
       var toStop = route.FirstOrDefault(
           stop => stop.StationId == request.ToStationId);
       if (fromStop is null || toStop is null)
       {
           throw new InvalidOperationException(
               "The selected stations are not valid for this train.");
       }
       if (fromStop.StopOrder >= toStop.StopOrder)
       {
           throw new InvalidOperationException(
               "Origin station must occur before destination station.");
       }
       var fare = await trainClient.GetFareAsync(
           request.TrainId,
           request.FromStationId,
           request.ToStationId,
           request.CoachType);
       var totalAmount = fare.Amount * request.Passengers.Count;
       if (totalAmount <= 0)
       {
           throw new InvalidOperationException(
               "The booking fare must be greater than zero.");
       }
       var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
       var challengeId = Convert.ToHexString(
           RandomNumberGenerator.GetBytes(32));
       var fingerprint = CreateRequestFingerprint(request);
       var expiresAt = DateTime.UtcNow.AddMinutes(OtpValidityMinutes);
       var challenge = new OtpChallenge
       {
           UserId = userId,
           Fingerprint = fingerprint,
           OtpHash = HashValue(otp),
           Amount = totalAmount,
           ExpiresAt = expiresAt,
           Attempts = 0
       };
       var mailData = new Dictionary<string, string>
       {
           ["otp"] = otp,
           ["amount"] = totalAmount.ToString("0.00"),
           ["expiresIn"] = OtpValidityMinutes.ToString()
       };
       var mailResult = await mailClient.SendAsync(
           user.Email,
           "PaymentOtp",
           mailData);
       if (!mailResult.Success)
       {
           throw new InvalidOperationException(
               "The payment OTP could not be sent to your registered email.");
       }
       Challenges[challengeId] = challenge;
       return new PaymentOtpResponse(
           challengeId,
           MaskEmail(user.Email),
           totalAmount,
           OtpValidityMinutes * 60);
   }
   public Task<PaymentOtpVerificationResponse> VerifyOtpAsync(
       int userId,
       PaymentOtpVerifyRequest request)
   {
       CleanupExpiredEntries();
       if (string.IsNullOrWhiteSpace(request.ChallengeId))
       {
           throw new ArgumentException("OTP challenge is required.");
       }
       if (string.IsNullOrWhiteSpace(request.Otp))
       {
           throw new ArgumentException("OTP is required.");
       }
       if (request.Otp.Trim().Length != 6 ||
           !request.Otp.Trim().All(char.IsDigit))
       {
           throw new ArgumentException("OTP must be a 6-digit number.");
       }
       if (!Challenges.TryGetValue(request.ChallengeId, out var challenge))
       {
           throw new InvalidOperationException(
               "The OTP is invalid or has expired.");
       }
       if (challenge.UserId != userId)
       {
           throw new UnauthorizedAccessException(
               "This OTP does not belong to the current user.");
       }
       if (DateTime.UtcNow > challenge.ExpiresAt)
       {
           Challenges.TryRemove(request.ChallengeId, out _);
           throw new InvalidOperationException(
               "The OTP has expired. Please request a new OTP.");
       }
       var suppliedFingerprint =
           CreateRequestFingerprint(request.BookingRequest);
       if (!string.Equals(
               challenge.Fingerprint,
               suppliedFingerprint,
               StringComparison.Ordinal))
       {
           throw new InvalidOperationException(
               "The OTP does not belong to this booking request.");
       }
       lock (challenge)
       {
           if (challenge.Attempts >= MaximumAttempts)
           {
               Challenges.TryRemove(request.ChallengeId, out _);
               throw new InvalidOperationException(
                   "Maximum OTP attempts exceeded. Please request a new OTP.");
           }
           challenge.Attempts++;
           var suppliedOtpHash = HashValue(request.Otp.Trim());
           if (!string.Equals(
                   suppliedOtpHash,
                   challenge.OtpHash,
                   StringComparison.Ordinal))
           {
               var remaining = MaximumAttempts - challenge.Attempts;
               throw new InvalidOperationException(
                   remaining > 0
                       ? $"Incorrect OTP. {remaining} attempt(s) remaining."
                       : "Maximum OTP attempts exceeded. Please request a new OTP.");
           }
       }
       Challenges.TryRemove(request.ChallengeId, out _);
       var verificationToken = Convert.ToHexString(
           RandomNumberGenerator.GetBytes(32));
       VerifiedPayments[verificationToken] = new VerifiedPayment
       {
           UserId = userId,
           Fingerprint = challenge.Fingerprint,
           Amount = challenge.Amount,
           ExpiresAt = challenge.ExpiresAt
       };
       return Task.FromResult(
           new PaymentOtpVerificationResponse(
               verificationToken,
               Math.Max(
                   0,
                   (int)Math.Ceiling(
                       (challenge.ExpiresAt - DateTime.UtcNow).TotalSeconds))));
   }
   public Task<decimal> ConsumeVerificationAsync(
       int userId,
       BookingRequest request)
   {
       CleanupExpiredEntries();
       if (string.IsNullOrWhiteSpace(request.PaymentVerificationToken))
       {
           throw new InvalidOperationException(
               "Payment OTP verification is required before booking.");
       }
       if (!VerifiedPayments.TryGetValue(
               request.PaymentVerificationToken,
               out var verification))
       {
           throw new InvalidOperationException(
               "Payment verification is invalid or has expired. Please verify the OTP again.");
       }
       if (verification.UserId != userId)
       {
           throw new UnauthorizedAccessException(
               "Payment verification does not belong to the current user.");
       }
       if (DateTime.UtcNow > verification.ExpiresAt)
       {
           VerifiedPayments.TryRemove(
               request.PaymentVerificationToken,
               out _);
           throw new InvalidOperationException(
               "Payment verification has expired. Please request a new OTP.");
       }
       var fingerprint = CreateRequestFingerprint(request);
       if (!string.Equals(
               verification.Fingerprint,
               fingerprint,
               StringComparison.Ordinal))
       {
           throw new InvalidOperationException(
               "Payment verification does not match this booking.");
       }
       VerifiedPayments.TryRemove(
           request.PaymentVerificationToken,
           out _);
       return Task.FromResult(verification.Amount);
   }
   private static void ValidateRequest(
       int userId,
       BookingRequest request)
   {
       if (userId <= 0)
       {
           throw new ArgumentException("User ID must be positive.");
       }
       if (request.Passengers is null ||
           request.Passengers.Count is < 1 or > 6)
       {
           throw new ArgumentException(
               "Passenger count must be between 1 and 6.");
       }
       if (request.TrainId <= 0 ||
           request.FromStationId <= 0 ||
           request.ToStationId <= 0)
       {
           throw new ArgumentException(
               "Train and station IDs must be positive.");
       }
       if (request.FromStationId == request.ToStationId)
       {
           throw new ArgumentException(
               "Origin and destination stations must be different.");
       }
       if (request.JourneyDate.Date < DateTime.UtcNow.Date)
       {
           throw new ArgumentException(
               "Journey date cannot be in the past.");
       }
       if (!Enum.IsDefined(request.CoachType))
       {
           throw new ArgumentException(
               "Coach type is invalid.");
       }
       if (!Enum.IsDefined(request.Quota))
       {
           throw new ArgumentException(
               "Quota is invalid.");
       }
       foreach (var passenger in request.Passengers)
       {
           if (string.IsNullOrWhiteSpace(passenger.Name) ||
               passenger.Age <= 0 ||
               string.IsNullOrWhiteSpace(passenger.Address) ||
               !Enum.IsDefined(passenger.Gender))
           {
               throw new ArgumentException(
                   "Passenger information is invalid.");
           }
       }
       if (request.Quota == QuotaType.Ladies &&
           request.Passengers.Any(
               passenger => passenger.Gender != Gender.Female))
       {
           throw new ArgumentException(
               "Ladies quota requires all passengers to be female.");
       }
   }
   private static string CreateRequestFingerprint(
       BookingRequest request)
   {
       var canonicalRequest = new
       {
           request.TrainId,
           request.FromStationId,
           request.ToStationId,
           JourneyDate = request.JourneyDate.ToUniversalTime(),
           request.CoachType,
           request.Quota,
           Passengers = request.Passengers.Select(passenger => new
           {
               passenger.Name,
               passenger.Age,
               passenger.Gender,
               passenger.Address
           }).ToList()
       };
       var json = JsonSerializer.Serialize(canonicalRequest);
       return HashValue(json);
   }
   private static string HashValue(string value)
   {
       return Convert.ToHexString(
           SHA256.HashData(
               Encoding.UTF8.GetBytes(value)));
   }
   private static string MaskEmail(string email)
   {
       var atIndex = email.IndexOf('@');
       if (atIndex <= 0)
       {
           return "***";
       }
       var localPart = email[..atIndex];
       var domain = email[atIndex..];
       if (localPart.Length == 1)
       {
           return $"*{domain}";
       }
       if (localPart.Length == 2)
       {
           return $"{localPart[0]}*{domain}";
       }
       return $"{localPart[0]}***{domain}";
   }
   private static void CleanupExpiredEntries()
   {
       var now = DateTime.UtcNow;
       foreach (var item in Challenges)
       {
           if (item.Value.ExpiresAt <= now)
           {
               Challenges.TryRemove(item.Key, out _);
           }
       }
       foreach (var item in VerifiedPayments)
       {
           if (item.Value.ExpiresAt <= now)
           {
               VerifiedPayments.TryRemove(item.Key, out _);
           }
       }
   }
   private sealed class OtpChallenge
   {
       public int UserId { get; init; }
       public string Fingerprint { get; init; } = string.Empty;
       public string OtpHash { get; init; } = string.Empty;
       public decimal Amount { get; init; }
       public DateTime ExpiresAt { get; init; }
       public int Attempts { get; set; }
   }
   private sealed class VerifiedPayment
   {
       public int UserId { get; init; }
       public string Fingerprint { get; init; } = string.Empty;
       public decimal Amount { get; init; }
       public DateTime ExpiresAt { get; init; }
   }
}
