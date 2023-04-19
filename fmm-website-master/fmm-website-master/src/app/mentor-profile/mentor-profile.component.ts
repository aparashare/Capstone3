import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';

import { MentorService } from '../core/services/mentor.service';
import { ShortUser, UserMentorAccount, UserMentorSchedule } from '../core/models/Mentor';
import { UserService } from '../core/services/user.service';
import { User, UserEducations } from '../core/models/User';
import { Workshop } from '../core/models/Workshop';
import { WorkshopService } from '../core/services/workshop.service';
import { MentorReview } from '../core/models/MentorReview';
import { PaymentDialogComponent } from '../class-landing/payment-dialog/payment-dialog.component';
import { PaymentForm } from '../core/models/PaymentForm';

@Component({
  selector: 'app-mentor-profile',
  templateUrl: './mentor-profile.component.html',
  styleUrls: ['./mentor-profile.component.sass'],
  providers: []
})
export class MentorProfileComponent implements OnInit, OnDestroy {
  public mentor: UserMentorAccount;
  private mentorId: number;
  public mentorWorkshops: Workshop[];
  public userObservable;
  public reviewsObservable: Subscription;
  public user: User;
  public schedule: UserMentorSchedule[];
  public reviews: MentorReview[];

  public bookingForm: FormGroup;
  public paymentForm: PaymentForm;

  public readonly REQUIRED_FIELD = 'This field is required';

  public time = ['00:00 AM', '00:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM', '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM',
    '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM',
    '11:00 PM', '11:30 PM'];
  
  public days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  constructor(public mentorService: MentorService,
              public userService: UserService,
              public workshopService: WorkshopService,
              private route: ActivatedRoute,
              private fb: FormBuilder,
              private router: Router,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe(paramMap => {
      this.mentorId = +paramMap.get('id');
      if (this.mentorId) {
       this.userObservable = this.mentorService.getUserMentorAccount(this.mentorId).pipe(
          mergeMap(mentor => {
            this.mentor = mentor;
            return this.userService.getUser((mentor.user as ShortUser).id);
          })).subscribe(user => {
            this.user = user;
            let params = new HttpParams().set('mentor', String(this.mentor.id));
            this.mentorService.getUserMentorSchedules(params).subscribe(res => this.schedule = res.results as UserMentorSchedule[]);
            params = new HttpParams().set('page_size', String(3));
            this.workshopService.getWorkshops(params).subscribe(res => this.mentorWorkshops = res.results);
            this.reviewsObservable = this.mentorService.getMentorReviews(this.mentor.id).subscribe(res => {
              this.reviews = res.results as MentorReview[];
            });
          });
      } else {
        this.userService.user.subscribe(data => {
          this.user = data;
          this.mentor = data.mentor_account;
          const params = new HttpParams().set('mentor', String(this.mentor.id));
          this.mentorService.getUserMentorSchedules(params).subscribe(res => this.schedule = res.results as UserMentorSchedule[]);
          this.reviewsObservable = this.mentorService.getMentorReviews(this.mentor.id).subscribe(res => {
            this.reviews = res.results as MentorReview[];
          });
        })
      }
    })
  }

  uniqueUserEducations(): UserEducations[] {
    return this.user.educations.filter((education, index, self) =>
    index === self.findIndex((edu) => (
      edu.school_name === education.school_name &&
      edu.school_start === education.school_start &&
      edu.school_end === education.school_end
    )))
  }

  mentorTag(): string {
    const yearsOfExperience = this.mentor.years_of_experience;
    if (yearsOfExperience <= 4) {
      return 'Bronze';
    }
    if (yearsOfExperience >= 5 && yearsOfExperience <= 9) {
      return 'Silver';
    }
    if (yearsOfExperience >= 10  && yearsOfExperience <= 16) {
      return 'Gold';
    }
    if (yearsOfExperience >= 17  && yearsOfExperience <= 24) {
      return 'Platinum';
    }
    if (yearsOfExperience >= 25) {
      return 'Diamond';
    }
  }

  selectedDaySlots(): UserMentorSchedule[] {
    const sessionDate = this.bookingForm.controls.sessionDate.value;
    if (sessionDate) {
      const selectedDay = this.days[(sessionDate as Date).getDay()];
      const schedule = this.schedule.filter(sch => sch.day === selectedDay);
      return schedule;
    } else {
      return [];
    }
  }

  populateTimeSlots(): void {
    const sessionDate = this.bookingForm.controls.sessionDate.value;
    this.timeSlots().clear();
    if (sessionDate) {
      const selectedDay = this.days[(sessionDate as Date).getDay()];
      const schedule = this.schedule.find((sch) => sch.day === selectedDay);
      if (schedule) {
        this.halfHourSlots(schedule.start_at, schedule.end_at).forEach((slot) =>
          this.timeSlots().push(
            this.fb.group({
              startAt: [slot.startAt],
              endAt: [slot.endAt],
              selected: [false]
            })
          )
        );
      }
    }
  }

  formIsValid(): boolean {
    return this.bookingForm.valid && this.timeSlots().controls.map(fg => fg.value.selected).some(value => value);
  }

  halfHourSlots(batchStartAt: string, batchEndAt: string): { startAt: string, endAt: string }[] {
    const timeStartIndex = this.time.indexOf(this.getTimeValue(batchStartAt));
    const timeEndIndex = this.time.indexOf(this.getTimeValue(batchEndAt));
    const slotHours = this.time.slice(timeStartIndex, timeEndIndex + 1);
    return Array(Math.ceil(slotHours.length - 1))
      .fill(0)
      .map((_, index) => index)
      .map((begin) => slotHours.slice(begin, begin + 2))
      .map((slot) => ({ startAt: slot[0], endAt: slot[1] }));
  }

  bookSession(): void {
    if (this.formIsValid()) {
      // TODO Book session before payment to get the correct payment details
      this.openPaymentDialog();
    }
  }

  timeSlots(): FormArray { return this.bookingForm.get('timeSlots') as FormArray; }

  private openPaymentDialog(): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '700px',
      data: this.paymentForm
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log(this.bookingForm.value);
      this.bookingForm.reset();
      // TODO Decide the landing screen after booking a session;
    });
  }

  private initForm(): void {
    this.bookingForm = this.fb.group({
      sessionDate: ['', Validators.required],
      timeSlots: this.fb.array([]),
      purpose: ['', Validators.required]
    })
  }

  private getTimeValue(value: string): string {
    // timeArray[0] hours - timeArray[1] minutes - timeArray[2] seconds
    const timeArray = value.split(':');
    return `${+timeArray[0] < 12 ? timeArray[0] : +timeArray[0] - 12}:${timeArray[1]} ${+timeArray[0] < 12 ? 'AM' : 'PM'}`;
  }

  ngOnDestroy(): void {
    if (this.userObservable) {
      this.userObservable.unsubscribe();
    }
    if (this.reviewsObservable) {
      this.reviewsObservable.unsubscribe();
    }
  }
}
