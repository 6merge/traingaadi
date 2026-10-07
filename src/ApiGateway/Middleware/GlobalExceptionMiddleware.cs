namespace ApiGateway.Middleware;
public sealed class GlobalExceptionMiddleware
{
   private readonly RequestDelegate _next;
   private readonly ILogger<GlobalExceptionMiddleware> _logger;
   public GlobalExceptionMiddleware(
       RequestDelegate next,
       ILogger<GlobalExceptionMiddleware> logger)
   {
       _next = next;
       _logger = logger;
   }
   public async Task InvokeAsync(HttpContext context)
   {
       try
       {
           await _next(context);
       }
       catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
       {
           // The client cancelled the request.
           // Do not treat this as an application/server error.
           _logger.LogInformation(
               "Request was cancelled by the client. TraceId: {TraceId}",
               context.TraceIdentifier);
           return;
       }
       catch (OperationCanceledException exception)
       {
           // Cancellation happened inside the application/downstream call,
           // but the client itself did not cancel the request.
           _logger.LogWarning(
               exception,
               "Operation was cancelled while processing request. TraceId: {TraceId}",
               context.TraceIdentifier);
           if (!context.Response.HasStarted)
           {
               context.Response.StatusCode =
                   StatusCodes.Status503ServiceUnavailable;
               await context.Response.WriteAsJsonAsync(
                   new ErrorResponse(
                       StatusCodes.Status503ServiceUnavailable,
                       "ServiceUnavailable",
                       "The requested service is temporarily unavailable.",
                       context.TraceIdentifier));
           }
           return;
       }
       catch (Exception exception)
       {
           _logger.LogError(
               exception,
               "An unhandled exception occurred. TraceId: {TraceId}",
               context.TraceIdentifier);
           if (context.Response.HasStarted)
           {
               // The response has already started, so we cannot
               // safely replace it with an error response.
               return;
           }
           context.Response.StatusCode =
               StatusCodes.Status500InternalServerError;
           await context.Response.WriteAsJsonAsync(
               new ErrorResponse(
                   StatusCodes.Status500InternalServerError,
                   "UnexpectedError",
                   "An unexpected error occurred.",
                   context.TraceIdentifier));
       }
   }
}
