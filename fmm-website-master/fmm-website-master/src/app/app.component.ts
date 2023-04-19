import { Router, NavigationEnd } from '@angular/router';
import { Component } from '@angular/core';

import { AuthService } from './auth/auth.service';
import { UserService } from './core/services/user.service';
import { environment } from 'src/environments/environment';

// declare gives Angular app access to gtag function
declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'findMeMentor';
  constructor(private authService: AuthService,
              private userService: UserService,
              private router: Router) {
    if (this.authService.checkLogin()) {
      this.authService.isLogged$.next(true);
      this.userService.getSelf().subscribe();
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        gtag('config', environment.googleAnalyticsId, {
          page_path: event.urlAfterRedirects,
        });
      }
    });
  }
}


