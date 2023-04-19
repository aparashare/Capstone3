import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ErrorService} from './error.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private errorService: ErrorService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError<any, any>((error: HttpErrorResponse) => {
          if (error.error?.error_description) {
            this.errorService.open(error?.error?.error_description);
          } else {
            this.errorService.open(typeof(error.error) === 'string' ? error?.error?.split('\n')[1] : Object.values(error?.error)[0]);
          }
          return throwError(error);
        })
      )
  }

}
