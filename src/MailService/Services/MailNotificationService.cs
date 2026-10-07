using MailService.DTOs;
using MailService.Email;
namespace MailService.Services;
public sealed class MailNotificationService(
   ISmtpMailSender smtpMailSender,
   ILogger<MailNotificationService> logger) : IMailNotificationService
{
   public async Task<SendMailResponse> SendAsync(
       SendMailRequest request)
   {
       ValidateRequest(request);
       try
       {
           var emailMessage = BuildEmailMessage(request);
           await smtpMailSender.SendAsync(emailMessage);
           return new SendMailResponse(
               true,
               "Notification sent successfully.");
       }
       catch (Exception exception)
       {
           request.Data.TryGetValue(
               "pnr",
               out var pnr);
           logger.LogError(
               exception,
               "Mail delivery failed for template {Template} and PNR {Pnr}.",
               request.Template,
               pnr ?? "not supplied");
           return new SendMailResponse(
               false,
               "Notification could not be sent.");
       }
   }
   private static void ValidateRequest(
       SendMailRequest request)
   {
       if (string.IsNullOrWhiteSpace(request.To))
       {
           throw new ArgumentException(
               "Recipient email address is required.");
       }
       if (string.IsNullOrWhiteSpace(request.Template))
       {
           throw new ArgumentException(
               "Notification template is required.");
       }
       if (request.Data is null)
       {
           throw new ArgumentException(
               "Notification data is required.");
       }
   }
   private static EmailMessage BuildEmailMessage(
       SendMailRequest request)
   {
       return request.Template switch
       {
           "PaymentOtp" =>
               new EmailMessage(
                   request.To,
                   "Railway payment verification OTP",
                   BuildPaymentOtpBody(request.Data)),
           "BookingConfirmed" =>
               new EmailMessage(
                   request.To,
                   "Railway booking confirmed",
                   BuildBookingConfirmedBody(request.Data)),
           "BookingWaitlisted" =>
               new EmailMessage(
                   request.To,
                   "Railway booking waitlisted",
                   BuildBookingWaitlistedBody(request.Data)),
           "Cancellation" =>
               new EmailMessage(
                   request.To,
                   "Railway booking cancelled and refund initiated",
                   BuildCancellationBody(request.Data)),
           "WaitlistPromotion" =>
               new EmailMessage(
                   request.To,
                   "Railway booking confirmed from waitlist",
                   BuildWaitlistPromotionBody(request.Data)),
           _ => throw new ArgumentException(
               $"Unsupported notification template: {request.Template}")
       };
   }
   private static string BuildPaymentOtpBody(
       Dictionary<string, string> data)
   {
       return
           "Your Railway Reservation System payment verification OTP is:"
           + Environment.NewLine
           + Environment.NewLine
           + $"OTP: {GetValue(data, "otp")}"
           + Environment.NewLine
           + Environment.NewLine
           + $"Payment Amount: ₹{GetValue(data, "amount")}"
           + Environment.NewLine
           + $"Valid For: {GetValue(data, "expiresIn")} minutes"
           + Environment.NewLine
           + Environment.NewLine
           + "Enter this OTP in the Dummy Payment Gateway to complete your booking."
           + Environment.NewLine
           + Environment.NewLine
           + "Do not share this OTP with anyone."
           + Environment.NewLine
           + Environment.NewLine
           + "This is a dummy payment gateway for the Railway Reservation System."
           + Environment.NewLine
           + "No card, CVV, expiry, UPI ID or bank details are required.";
   }
   private static string BuildBookingConfirmedBody(
       Dictionary<string, string> data)
   {
       return
           "Your railway booking has been confirmed."
           + Environment.NewLine
           + Environment.NewLine
           + $"PNR: {GetValue(data, "pnr")}"
           + Environment.NewLine
           + $"Train: {GetValue(data, "trainNumber")}"
           + Environment.NewLine
           + $"Journey Date: {GetValue(data, "journeyDate")}"
           + Environment.NewLine
           + $"From: {GetValue(data, "from")}"
           + Environment.NewLine
           + $"To: {GetValue(data, "to")}"
           + Environment.NewLine
           + Environment.NewLine
           + "Passenger / Seat Details:"
           + Environment.NewLine
           + GetValue(data, "passengerSeats")
           + Environment.NewLine
           + Environment.NewLine
           + $"Total Ticket Price: ₹{GetValue(data, "amount")}"
           + Environment.NewLine
           + Environment.NewLine
           + "Thank you for booking with Railway Reservation System.";
   }
   private static string BuildBookingWaitlistedBody(
       Dictionary<string, string> data)
   {
       return
           "Your railway booking has been placed on the waitlist."
           + Environment.NewLine
           + Environment.NewLine
           + $"PNR: {GetValue(data, "pnr")}"
           + Environment.NewLine
           + $"Train: {GetValue(data, "trainNumber")}"
           + Environment.NewLine
           + $"Journey Date: {GetValue(data, "journeyDate")}"
           + Environment.NewLine
           + $"From: {GetValue(data, "from")}"
           + Environment.NewLine
           + $"To: {GetValue(data, "to")}"
           + Environment.NewLine
           + $"Current Waitlist Position: {GetValue(data, "waitlistPosition")}"
           + Environment.NewLine
           + Environment.NewLine
           + $"Ticket Price Paid: ₹{GetValue(data, "amount")}"
           + Environment.NewLine
           + Environment.NewLine
           + "You will receive another email if your waitlisted booking is promoted to confirmed.";
   }
   private static string BuildCancellationBody(
       Dictionary<string, string> data)
   {
       return
           "Your railway booking has been cancelled successfully."
           + Environment.NewLine
           + Environment.NewLine
           + $"PNR: {GetValue(data, "pnr")}"
           + Environment.NewLine
           + $"Train: {GetValue(data, "trainNumber")}"
           + Environment.NewLine
           + $"Journey Date: {GetValue(data, "journeyDate")}"
           + Environment.NewLine
           + $"From: {GetValue(data, "from")}"
           + Environment.NewLine
           + $"To: {GetValue(data, "to")}"
           + Environment.NewLine
           + Environment.NewLine
           + $"Refund Amount: ₹{GetValue(data, "refundAmount")}"
           + Environment.NewLine
           + Environment.NewLine
           + "The full ticket amount has been refunded to your account."
           + Environment.NewLine
           + Environment.NewLine
           + "Thank you for using Railway Reservation System.";
   }
   private static string BuildWaitlistPromotionBody(
       Dictionary<string, string> data)
   {
       return
           "Your railway booking has been confirmed from the waitlist."
           + Environment.NewLine
           + Environment.NewLine
           + $"PNR: {GetValue(data, "pnr")}"
           + Environment.NewLine
           + $"Train: {GetValue(data, "trainNumber")}"
           + Environment.NewLine
           + $"Journey Date: {GetValue(data, "journeyDate")}"
           + Environment.NewLine
           + $"From: {GetValue(data, "from")}"
           + Environment.NewLine
           + $"To: {GetValue(data, "to")}"
           + Environment.NewLine
           + Environment.NewLine
           + "Passenger / Seat Details:"
           + Environment.NewLine
           + GetValue(data, "passengerSeats")
           + Environment.NewLine
           + Environment.NewLine
           + $"Ticket Price: ₹{GetValue(data, "amount")}"
           + Environment.NewLine
           + Environment.NewLine
           + "No additional payment is required for this waitlist promotion.";
   }
   private static string GetValue(
       Dictionary<string, string> data,
       string key)
   {
       if (!data.TryGetValue(key, out var value) ||
           string.IsNullOrWhiteSpace(value))
       {
           throw new ArgumentException(
               $"Notification data field '{key}' is required.");
       }
       return value;
   }
}
