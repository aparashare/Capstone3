import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Workshop} from '../models/Workshop';
import {ApiResponse} from '../models/ApiResponse';
import {WorkshopUser} from '../models/WorkshopUser';
import {PaymentForm} from '../models/PaymentForm';
import * as moment from 'moment';
import {WorkshopReview} from '../models/WorkshopReview';
import { WorkshopCoupon } from '../models/WorkshopCoupon';
import {environment} from '../../../environments/environment';

const API_URL = environment.API_URL+'/api';
const API_URL_2 = environment.SOCKET_ENDPOINT+'/api';
const API_VERSION = '/v0';

@Injectable({
  providedIn: 'root'
})
export class WorkshopService {

  constructor(public http: HttpClient) { }

  getWorkshop(workshopId): Observable<Workshop> {
    return this.http.get<Workshop>(API_URL + API_VERSION + `/workshops/${workshopId}/`);
  }
  getWorkshopEnrolledUsers(workshopId): Observable<any> {
    return this.http.get<Workshop>(API_URL + API_VERSION + `/workshops/${workshopId}/enrolled_users/`);
  }
  postWorkshop(workshop): Observable<Workshop> {
    return this.http.post<Workshop>(API_URL + API_VERSION + '/workshops/', workshop);
  }

  getWorkshops(p?, onlyFuture = true): Observable<ApiResponse> {
    if (p) {
      if (onlyFuture) {p = p.set('start_at__gte', moment().toISOString());}
      return this.http.get<ApiResponse>(API_URL + API_VERSION + '/workshops/', {params: p});
    } else if (onlyFuture) {
      const pa = new HttpParams().set('start_at__gte', moment().toISOString());
      return this.http.get<ApiResponse>(API_URL + API_VERSION + '/workshops/', {params: pa});
    } else {
      return this.http.get<ApiResponse>(API_URL + API_VERSION + '/workshops/');
    }
  }

  registerForWorkshop(workshopId, userId): Observable<WorkshopUser> {
    const b = new HttpParams().set('workshop', String(workshopId)).set('user', String(userId));
    return this.http.post<WorkshopUser>(API_URL + API_VERSION + '/workshop_users/', b);
  }
  createWorkshopCoupon(discount: number, code: string, workshopId: number): Observable<WorkshopCoupon> {
    const b = new HttpParams()
      .set('discount', String(discount))
      .set('code', code)
      .set('workshop', String(workshopId));
    return this.http.post<WorkshopCoupon>(API_URL + API_VERSION + '/workshop_coupons/', b);
  }

  workshopPay(workshopUserId): Observable<PaymentForm> {
    return this.http.post<PaymentForm>(API_URL + API_VERSION + `/workshop_users/${workshopUserId}/pay/`, {});
  }

  getWorkshopPayedUsers(workshopId): Observable<WorkshopUser[]> {
    return this.http.get<WorkshopUser[]>(API_URL + API_VERSION + `/workshops/${workshopId}/payed_users/`);
  }
  getWorkshopStatus(p): Observable<any[]> {

    return this.http.get<any>(API_URL_2 + `/classStatus`,{params: p});
  }
  getWorkshopDuration(p): Observable<any[]> {

    return this.http.get<any>(API_URL_2 + `/classDurations`,{params: p});
  }
  getWorkshopUsers(userId): Observable<WorkshopUser[]> {
    return this.http.get<WorkshopUser[]>(API_URL + API_VERSION + `/workshop_users/${userId}/`);
  }

  postWorkshopReview(review): Observable<WorkshopReview> {
    return this.http.post<WorkshopReview>(API_URL + API_VERSION + '/workshop_reviews/', review);
  }
  postWorkshopPayment(review): Observable<WorkshopReview> {
    return this.http.post<WorkshopReview>(API_URL + API_VERSION + '/razorpay_payments/', review);
  }
  postNotes(data): Observable<any> {
    return this.http.post<any>(API_URL + API_VERSION + '/notes/', data);
  }
  getNotes(param): Observable<any> {
    return this.http.get<any>(API_URL + API_VERSION + '/notes/',{params: param});
  }

}
