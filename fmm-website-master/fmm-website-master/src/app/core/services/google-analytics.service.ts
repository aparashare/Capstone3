import { Injectable } from '@angular/core';

// declare gives Angular app access to gtag function
declare let gtag: Function;

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService {
  public eventEmitter(
    eventName: string,
    eventCategory: string,
    eventValue: string = null
  ) {
    gtag('event', eventName, {
      event_category: eventCategory,
      event_label: eventValue
    });
  }
}
