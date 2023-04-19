import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../core/services/user.service';
import {User, UserEducations, UserPersonalInfo, UserSocialInformation} from '../core/models/User';

@Component({
  selector: 'app-mentee-profile',
  templateUrl: './mentee-profile.component.html',
  styleUrls: ['./mentee-profile.component.sass']
})
export class MenteeProfileComponent implements OnInit, OnDestroy {
  public user: User;
  public userInformation: UserPersonalInfo;
  public subscription;
  public education: UserEducations;
  public socialInformation: UserSocialInformation;
  constructor(private userService: UserService) { }

  ngOnInit() {
   this.subscription = this.userService.getSelf().subscribe(
      data => {
        this.user = data;
        this.userService.getPersonalInformation(this.user.id)
          .subscribe(res => this.userInformation = res.results[0]);
        this.userService.getEducationInformation(data.id)
          .subscribe(res => this.education = res.results[0] as UserEducations);
        this.userService.getSocialInformation(data.id)
          .subscribe(res => this.socialInformation = res.results[0] as UserSocialInformation);
      }
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
