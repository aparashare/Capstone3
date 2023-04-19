import { Component, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, Validators, FormArray} from '@angular/forms';
import * as moment from 'moment';
import {Router} from '@angular/router';
import {mergeMap, tap} from 'rxjs/operators';
import {forkJoin} from 'rxjs';

import {User, UserEducations, UserPersonalInfo, UserSocialInformation} from '../core/models/User';
import {UserService} from '../core/services/user.service';
import { ErrorService } from './../auth/error.service';
import { PersonalInformationComponent } from '../core/personal-information/personal-information.component';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.sass']
})
export class RegistrationFormComponent implements OnInit {
  public days;
  public months;
  public years;
  public user: User;
  public menteeForm;
  public userForm;
  public personalInformation;
  public userEducation;
  public personalInfo;
  private subscription;
  public education: UserEducations;
  public socialMedia;
  public userInformation: UserPersonalInfo;
  public socialInformation: UserSocialInformation;

  public readonly REQUIRED_FIELD = 'This field is required';
  public readonly INVALID_URL_FIELD = 'This url is invalid';

  private readonly URL_REGEX = /^(ftp|http|https):\/\/[^ "]+$/;

  @ViewChild('personalInformationComponent') public personalInformationComponent: PersonalInformationComponent;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private userService: UserService,
              private errorService: ErrorService) {
    this.days = Array.from({length: 31}, (v, k) => k + 1);
    this.months = Array.from({length: 12}, (v, k) => k + 1);
    this.years = Array.from({length: 100}, (v, k) => k + +moment().format('YYYY') - 100).reverse();
    this.subscription = this.userService.getSelf().pipe(
      tap(data => this.user = data),
      mergeMap(data => {
        return forkJoin([
            this.userService.getPersonalInformation(data.id),
            this.userService.getEducationInformation(data.id),
            this.userService.getSocialInformation(data.id)]
        )}
      )
    ).subscribe(a => {
      this.userInformation = a[0].results[0];
      this.education = a[1].results[0];
      this.socialInformation = a[2].results[0];
      this.initializeForm();
    });
  }

  ngOnInit() {}

  initializeForm() {
    this.userForm = this.formBuilder.group({
      first_name: [this.user?.first_name, Validators.required],
      last_name: [this.user?.last_name, Validators.required]
    });
    this.personalInformation = this.formBuilder.group({
      gender: [''],
      phone: [''],
      birthday: [''],
      country_of_origin: [''],
      city: [''],
      profession: [this.userInformation?.profession],
      about: [this.userInformation?.about],
      preferences: [this.userInformation?.preferences],
      user: [],
    });
    this.menteeForm = this.formBuilder.group({
      profession: [this.userInformation?.profession],
      about: [this.userInformation?.about],
      preferences: [this.userInformation?.preferences],
      school_name: [this.education?.school_name],
      school_start: [this.education?.school_start],
      school_end: [this.education?.school_end],
      facebook: [this.socialInformation?.facebook],
      linkedin: [this.socialInformation?.linkedin],
      avatar: ['',Validators.required],
    });
    this.userEducation = this.formBuilder.group({
      school_name: [''],
      school_start: [''],
      school_end: [''],
      user: [],
    });
    this.socialMedia = this.formBuilder.group({
      facebook: [''],
      linkedin: [''],
      user: [],
    });
  }

  public doSomething(info: any):void {
    this.userForm.get('first_name').setValue(info.first_name);
    this.userForm.get('last_name').setValue(info.last_name);
    this.personalInformation.get('gender').setValue(info.gender);
    this.personalInformation.get('birthday').setValue('2001-01-01');
    this.personalInformation.get('phone').setValue(info.phone);
    this.personalInformation.get('country_of_origin').setValue('IN');
    this.personalInformation.get('city').setValue('abc');
    // this.personalInformation.get('birthday').setValue(info.year + '-' + info.month + '-' +info.day);
    // this.personalInformation.get('phone').setValue(info.phone);
    // this.personalInformation.get('country_of_origin').setValue(info.country_of_origin);
    // this.personalInformation.get('city').setValue(info.city);
    this.menteeForm.get('avatar').setValue(info.avatar);
  }

  submitForm() {
    this.personalInformationComponent.personalInformationForm.markAllAsTouched();

    this.personalInformation.get('preferences').setValue('abc');
    this.personalInformation.get('profession').setValue('abc');
    this.personalInformation.get('about').setValue('abc');
    this.personalInformation.get('user').setValue(this.user.id);

    this.userEducation.get('school_name').setValue('abc');
    this.userEducation.get('school_start').setValue('2019');
    this.userEducation.get('school_end').setValue('2020');
    this.userEducation.get('user').setValue(this.user.id);
    const education = this.userEducation.value;
    if (education.school_end === '0') {delete education.school_end}

    this.socialMedia.get('facebook').setValue('abc');
    this.socialMedia.get('linkedin').setValue('abc');
    this.socialMedia.get('user').setValue(this.user.id);

    const formData = new FormData();
    // formData.append('avatar', this.menteeForm.get('avatar').value);
    if (this.userForm.valid && this.personalInformation.valid && this.personalInformationComponent.personalInformationForm.valid) {
      if(this.personalInfo || this.userInformation) {
        this.userService.patchUserPersonalInformation(this.personalInformation.value, this.user.id).subscribe();
      } else {
        this.userService.postUserPersonalInformation(this.personalInformation.value).subscribe(
          res => this.userService.registerInYuWee(this.user.id).subscribe()
        );
      }
      if (this.education && !this.personalInfo) {
        this.userService.patchUserEducations(education, this.user.id).subscribe();
      } else if (!this.personalInfo) {
        this.userService.postUserEducations(education).subscribe();
      }
      this.userService.patchUser(formData, this.user.id).subscribe();
      if (this.socialInformation) {
        this.userService.patchSocialNetworks(this.socialMedia.value, this.socialInformation.id).subscribe();
      } else {
        this.userService.postSocialNetworks(this.socialMedia.value).subscribe();
      }
      this.errorService.open('Registration Form Successfully submitted');
      this.userService.patchUser(this.userForm.value, this.user.id).subscribe(() => {
        this.router.navigate(['/dashboard'])
        console.log("submitted")
      });
    }
  }

  get currentYear() {
    return (new Date()).getFullYear();
  }
}
