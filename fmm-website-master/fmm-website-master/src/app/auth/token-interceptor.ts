import {Injectable} from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {CookieService} from 'ngx-cookie-service';

export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable()

export class TokenInterceptor implements HttpInterceptor {
  constructor(private cookieService: CookieService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.headers.has(InterceptorSkipHeader)) {
      const headers = request.headers.delete(InterceptorSkipHeader);
      return next.handle(request.clone({ headers }));
    } else {
      if (this.cookieService.get('token')) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${this.cookieService.get('token')}`
          }
        });
      }
    }
    return next.handle(request).pipe(catchError(err => {
      const error = err.statusText;
      return throwError(error);
    }));
  }
}
