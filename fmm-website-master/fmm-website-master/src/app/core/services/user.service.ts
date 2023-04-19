import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {User } from '../models/User';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {tap} from 'rxjs/operators';
import {ApiResponse} from '../models/ApiResponse';
import {YuWeeUser} from '../models/YuWeeUser';
import {environment} from '../../../environments/environment';


const API_URL = environment.API_URL+'/api';
const API_VERSION = '/v0';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public user = new ReplaySubject<User>(1);
  public firstEntrance = new BehaviorSubject(false);
  constructor(public http: HttpClient) { }

  getSelf(): Observable<User> {
    return this.http.get<User>(API_URL + API_VERSION + '/users/self/').pipe(
      tap(user => {
        if (user.first_name) { this.firstEntrance.next(true); }
        this.user.next(user);
      })
    );
  }

  public getUser(userId): Observable<User> {
    return this.http.get<User>(API_URL + API_VERSION + `/users/${userId}/`);
  }
  public getMentorPublicUser(userId): Observable<User> {
    return this.http.get<User>(API_URL + API_VERSION + `/users_mentor_accounts_public/`,{params:{id:userId}});
  }

  patchUser(user, userId): Observable<any> {
    return this.http.patch<any>(API_URL + API_VERSION + `/users/${userId}/`, user);
  }

  postUserPersonalInformation(information): Observable<any> {
    return this.http.post<any>(API_URL + API_VERSION + '/users_personal_info/', information);
  }

  postUserEducations(educations): Observable<any> {
    return this.http.post<any>(API_URL + API_VERSION + '/users_educations/', educations);
  }

  patchUserPersonalInformation(information, userId): Observable<any> {
    return this.http.patch<any>(API_URL + API_VERSION + `/users_personal_info/${userId}/`, information);
  }

  patchUserEducations(educations, userId): Observable<any> {
    return this.http.patch<any>(API_URL + API_VERSION + `/users_educations/${userId}/`, educations);
  }

  getCountries(): Observable<any> {
    return this.http.get<any>(API_URL + API_VERSION +'/helper/countries/');
  }

  getCurrencies(): Observable<any> {
    return this.http.get<any>(API_URL + API_VERSION + '/helper/currencies/');
  }

  getPersonalInformation(id): Observable<ApiResponse> {
    const p = new HttpParams().set('user', id.toString());
    return this.http.get<ApiResponse>(API_URL + API_VERSION + '/users_personal_info/', {params: p});
  }

  getSocialInformation(id): Observable<ApiResponse> {
    const p = new HttpParams().set('user', id.toString());
    return this.http.get<ApiResponse>(API_URL + API_VERSION + '/users_social_info/', {params: p});
  }

  getEducationInformation(id): Observable<ApiResponse> {
    const p = new HttpParams().set('user', id.toString());
    return this.http.get<ApiResponse>(API_URL + API_VERSION + '/users_educations/', {params: p});
  }

  getWorkshopUser(userId): Observable<ApiResponse> {
    const p = new HttpParams().set('user', String(userId));
    return this.http.get<ApiResponse>(API_URL + API_VERSION + '/workshop_users/', {params: p});
  }

  getWorkshopParams(p: HttpParams): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(API_URL + API_VERSION + '/workshops/', {params: p});
  }

  getWorkshopAssignments(userId): Observable<ApiResponse> {
    const p = new HttpParams().set('user', String(userId));
    return this.http.get<ApiResponse>(API_URL + API_VERSION + '/workshop_assignments/', {params: p});
  }

  getWorkshopAssignmentsParams(p: HttpParams): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(API_URL + API_VERSION + '/workshop_assignments/', {params: p});
  }

  postSocialNetworks(socialNetworks): Observable<any> {
    return this.http.post<any>(API_URL + API_VERSION + '/users_social_info/', socialNetworks);
  }

  patchSocialNetworks(socialNetworks, id): Observable<any> {
    return this.http.patch<any>(API_URL + API_VERSION + `/users_social_info/${id}/`, socialNetworks);
  }

  getSelfYuwee(): Observable<YuWeeUser> {
    return this.http.get<YuWeeUser>(API_URL + API_VERSION + '/users/self/yuwee/');
  }

  getAppointmentUsers(userId): Observable<ApiResponse> {
    const p = new HttpParams().set('user', String(userId));
    return this.http.get<ApiResponse>(API_URL + API_VERSION + '/appointment_users/', {params: p});
  }

  getAppointmentUsersParams(p: HttpParams): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(API_URL + API_VERSION + '/appointment_users/', {params: p});
  }

  getTestimonials() {
    return this.http.get<ApiResponse>(API_URL + API_VERSION + '/testimonials/');
  }

  createLead(leadInfo) {
    return this.http.post(API_URL + API_VERSION + '/lead_users/', leadInfo);
  }

  registerInYuWee(id):Observable<any> {
    return this.http.post<any>(API_URL + API_VERSION + `/users/${id}/yuwee_register/`, {});
  }

}
