import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const extractErrorMessage = (error: HttpErrorResponse): string => {
  if (typeof error.error === 'string') {
    const trimmed = error.error.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  if (error.error && typeof error.error === 'object') {
    const payload = error.error as Record<string, unknown>;
    const message = payload['message'];
    const serverError = payload['error'];

    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }

    if (typeof serverError === 'string' && serverError.trim()) {
      return serverError.trim();
    }
  }

  switch (error.status) {
    case 400:
      return 'Please check the information entered.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'No booking was found for this PNR.';
    case 409:
      return 'The requested operation conflicts with existing data.';
    case 500:
      return 'Something went wrong. Please try again.';
    default:
      return 'Unable to complete the request.';
  }
};

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = extractErrorMessage(error);
      return throwError(() => new Error(message));
    }),
  );
