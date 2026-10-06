import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('railway_token');

  if (!token || req.url.startsWith(`${environment.apiBaseUrl}/api/auth/login`) || req.url.startsWith(`${environment.apiBaseUrl}/api/auth/register`)) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(cloned);
};
