import { Component, OnInit } from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {UserService} from '../core/services/user.service';
import {Observable} from 'rxjs';
import {User} from '../core/models/User';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  public user: Observable<User>;
  constructor(public auth: AuthService,
              public router: Router,
              private userService: UserService) {
    this.user = this.userService.user;
  }

  ngOnInit() {
  }

}
