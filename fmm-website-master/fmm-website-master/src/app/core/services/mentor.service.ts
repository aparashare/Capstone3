import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Expertise, UserMentorAccount } from '../models/Mentor';
import { ApiResponse } from '../models/ApiResponse';
import { MentorReview } from '../models/MentorReview';

import {environment} from '../../../environments/environment';


const API_URL = environment.API_URL+'/api';
const API_VERSION = '/v0';

@Injectable({
  providedIn: 'root'
})
export class MentorService {

  constructor(public http: HttpClient) { }

  postUserMentorsAccount(mentor): Observable<UserMentorAccount> {
    return this.http.post<UserMentorAccount>(API_URL + API_VERSION + '/users_mentor_accounts/', mentor);
  }

  patchUserMentorsAccount(mentor, id): Observable<UserMentorAccount> {
    return this.http.patch<UserMentorAccount>(API_URL + API_VERSION + `/users_mentor_accounts/${id}/`, mentor);
  }

  getUserMentorsAccounts(p?, approved = false): Observable<ApiResponse> {
    if (p && approved) {
      // p = p.set('')
      return this.http.get<ApiResponse>(API_URL + API_VERSION + '/users_mentor_accounts/', {params: p});
    } else if (p) {
      return this.http.get<ApiResponse>(API_URL + API_VERSION + '/users_mentor_accounts/', {params: p});
    } else if (approved) {
      const approval = new HttpParams().set('approved', String(true));
      return this.http.get<ApiResponse>(API_URL + API_VERSION + '/users_mentor_accounts/', {params: approval});
    } else {
      return this.http.get<ApiResponse>(API_URL + API_VERSION + '/users_mentor_accounts/');
    }
  }

  getUserMentorAccount(userId): Observable<UserMentorAccount> {
    return this.http.get<UserMentorAccount>(API_URL + API_VERSION + `/users_mentor_accounts/${userId}/`);
  }

  getUserMentorAccountWithOptions(p?): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(API_URL + API_VERSION + '/users_mentor_accounts/', {params: p});
  }

  getUserMentorSchedules(p?): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(API_URL + API_VERSION +  '/users_mentor_schedules/', {params: p});
  }

  getUserExpertise(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(API_URL + API_VERSION + '/users_expertise/');
  }

  getAllExpertise(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(API_URL + API_VERSION + '/users_expertise/all_expertises/');
  }

  postUserExpertise(expertise): Observable<Expertise> {
    return this.http.post<Expertise>(API_URL + API_VERSION + '/users_expertise/', expertise);
  }

  postUserMentorSchedule(schedule) {
    return this.http.post(API_URL + API_VERSION + '/users_mentor_schedules/', schedule);
  }

  getMentorRevenue(mentorId): Observable<Revenue> {
    return this.http.get<Revenue>(API_URL + API_VERSION + `/users_mentor_accounts/${mentorId}/revenue/`);
  }

  postMentorReview(review): Observable<MentorReview> {
    return this.http.post<MentorReview>(API_URL + API_VERSION + '/mentor_reviews/', review);
  }

  getMentorReviews(mentorId): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(API_URL + API_VERSION + `/mentor_reviews/${mentorId}`);
  }
}

export interface Revenue {
  workshops: number;
  appointments: number;
}
