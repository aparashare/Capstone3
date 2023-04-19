import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalInformationComponent } from './personal-information/personal-information.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../material.module';
import { MentorScheduleComponent } from './mentor-schedule/mentor-schedule.component';
import { SubmenuComponent } from './submenu/submenu.component';
import { MentorReviewComponent } from './mentor-review/mentor-review.component';
import { StarRatingComponent } from './star-rating/star-rating.component';

@NgModule({
    declarations: [
      PersonalInformationComponent,
      MentorScheduleComponent,
      SubmenuComponent,
      MentorReviewComponent,
      StarRatingComponent,
    ],
    exports: [
        PersonalInformationComponent,
        MentorScheduleComponent,
        SubmenuComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
    ]
})
export class CoreModule { }
