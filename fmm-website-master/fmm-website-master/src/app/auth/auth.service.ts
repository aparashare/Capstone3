import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import * as moment from 'moment';

import { environment } from '../../environments/environment';
import { Token } from '../core/models/Token';
import { InterceptorSkipHeader } from './token-interceptor';
import { CookieService } from 'ngx-cookie-service';
import { GoogleAnalyticsService } from '../core/services/google-analytics.service';

const API_URL = environment.API_URL+'/api';
const API_VERSION = '/v0';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isLogged$ = new BehaviorSubject(false);
  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    private googleAnalyticsService: GoogleAnalyticsService
  ) {}


  login(user, grantType = 'password'): Observable<Token> {
    this.cookieService.deleteAll('/');
    const p = new HttpParams()
      .set('username', user.username)
      .set('password', user.password)
      .set('grant_type', grantType)
      .set('client_id', environment.clientId);
    return this.http.post<Token>(API_URL + '/o/token/', p);
  }

  logout() {
    this.googleAnalyticsService.eventEmitter('logged_out', 'logout', this.cookieService.get('username'));
    this.cookieService.deleteAll('/');
    this.isLogged$.next(false);
    this.router.navigate(['/']);
  }

  checkLogin(): boolean {
    return !!(this.cookieService.get('token'));
  }

  setCookies(username, token: Token) {
    const expiration = moment().add(token.expires_in, 's');
    this.cookieService.set('token', token.access_token, expiration.toDate(), '/');
    this.cookieService.set('refresh_token', token.refresh_token, expiration.toDate(), '/');
    this.cookieService.set('username', username, expiration.toDate(), '/');
  }

  register(currentUser) {
    const headers = new HttpHeaders().set(InterceptorSkipHeader, '');
    return this.http.post(API_URL + API_VERSION + '/users/register/', currentUser, {headers});
  }

  requestPassword(p) {
    return this.http.get(API_URL + API_VERSION + '/users/password_recover/', {params: p});
  }

  restorePassword(paramsVal: HttpParams): Observable<any> {
    return this.http.patch(API_URL + API_VERSION + '/users/reset_password/', paramsVal);
  }

  subscribe(emailValue) {
    return this.http.post(API_URL + API_VERSION + '/subscription_users/',{email: emailValue});
  }
}
