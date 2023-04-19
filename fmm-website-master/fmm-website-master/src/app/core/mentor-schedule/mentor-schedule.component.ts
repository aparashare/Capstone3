import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';

import { UserService } from '../services/user.service';
import { MentorService } from '../services/mentor.service';
import { User } from '../models/User';
import { UserMentorAccount, UserMentorSchedule } from '../models/Mentor';

@Component({
  selector: 'app-mentor-schedule',
  templateUrl: './mentor-schedule.component.html',
  styleUrls: ['./mentor-schedule.component.sass']
})
export class MentorScheduleComponent implements OnInit, AfterViewInit {
  public mentorSchedule: FormGroup;
  public days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  public time = ['00:00 AM', '00:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM', '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM',
    '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM',
    '11:00 PM', '11:30 PM'];
  public currencies;
  public mentor: UserMentorAccount;
  @Input() user: User;

  public readonly REQUIRED_FIELD = 'This field is required';
  public readonly INVALID_FIELD = 'This field is invalid';

  constructor(private fb: FormBuilder,
              private router: Router,
              private mentorService: MentorService,
              private userService: UserService) {
  }

  ngAfterViewInit(): void {
    this.userService.user.subscribe(
      data => {
        this.user = data;
        const p = new HttpParams().set('user', String(this.user.id));
        this.mentorService.getUserMentorAccountWithOptions(p).subscribe(
          res => {
            this.mentor = res.results[0];
            this.initForm();
            const params = new HttpParams().set('mentor', String(this.mentor?.id));
            this.mentorService.getUserMentorSchedules(params).subscribe(response => {
              const schedules: UserMentorSchedule[] = response.results;
              if (schedules.length) {
                schedules.forEach(schedule => this.addTimeSlots(schedule));
              } else {
                this.addTimeSlots();
              }
            });
          }
        );

        this.currencies = this.userService.getCurrencies().subscribe(
          res => this.currencies = res
        );
      }
    );
  }

  initForm() {
    this.mentorSchedule = this.fb.group({
      half_charge_currency: [this.mentor?.half_charge_currency || ''],
      half_charge: [this.mentor?.half_charge || ''],
      full_charge_currency: [this.mentor?.full_charge_currency || ''],
      full_charge: [this.mentor?.full_charge || ''],
      user: [this.user.id],
      timeSlots: this.fb.array([])
    });
  }

  newTimeSlots(schedule: UserMentorSchedule): FormGroup {
    return this.fb.group({
      start_at: [schedule ? this.getTimeValue(schedule.start_at) : '', Validators.required],
      end_at: [schedule ? this.getTimeValue(schedule.end_at) : '', Validators.required],
      day: [schedule ? schedule.day : '', Validators.required],
      mentor: this.mentor?.id
    });
  }

  timeSlots(): FormArray {return this.mentorSchedule.get('timeSlots') as FormArray; }

  addTimeSlots(schedule: UserMentorSchedule = null): void {
    this.timeSlots().push(this.newTimeSlots(schedule));
  }

  removeTimeSlots(i: number) {this.timeSlots().removeAt(i); }

  ngOnInit() {}

  formSubmit() {
    if (this.mentorSchedule.valid && this.mentorSchedule.dirty) {
      this.mentorSchedule.get('timeSlots').value.forEach(v => {
          this.mentorService.postUserMentorSchedule(v).subscribe();
      });

      delete this.mentorSchedule.value.timeSlots;
      this.mentorService.patchUserMentorsAccount(this.mentorSchedule.value, this.mentor?.id)
        .subscribe(() => this.router.navigate(['/dashboard']));
    }
    if (!this.mentorSchedule.dirty) {
      this.router.navigate(['/dashboard']);
    }
  }

  private getTimeValue(value: string): string {
    // timeArray[0] hours - timeArray[1] minutes - timeArray[2] seconds
    const timeArray = value.split(':');
    return `${+timeArray[0] < 12 ? timeArray[0] : +timeArray[0] - 12}:${timeArray[1]} ${+timeArray[0] < 12 ? 'AM' : 'PM'}`;
  }
}
