import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { ApiResponse } from '../models/ApiResponse';

import {environment} from '../../../environments/environment';

const API_URL = environment.API_URL+'/api';
const API_VERSION = '/v0';

@Injectable({
  providedIn: 'root',
})
export class PagesService {
  constructor(public http: HttpClient) {}

  getAllFaqs(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(API_URL + API_VERSION + '/pages/faq/');
  };
  getPolicy(): Observable<Policy> {
    return this.http.get<Policy>(API_URL + API_VERSION + '/pages/privacy/');
  }
}
export interface Faq {
  id: number;
  title: string;
  body: string;
  status: string;
  tags: string;
}
export interface Policy {

  title: string;
  content: string;

}
