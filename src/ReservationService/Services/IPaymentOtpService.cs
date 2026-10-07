using ReservationService.DTOs;
namespace ReservationService.Services;
public interface IPaymentOtpService
{
   Task<PaymentOtpResponse> SendOtpAsync(int userId, BookingRequest request);
   Task<PaymentOtpVerificationResponse> VerifyOtpAsync(
       int userId,
       PaymentOtpVerifyRequest request);
   Task<decimal> ConsumeVerificationAsync(
       int userId,
       BookingRequest request);
}
