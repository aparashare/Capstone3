import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MentorProfileComponent } from './mentor-profile.component';
import {MaterialModule} from '../material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MentorProfileComponentRoutingModule} from './mentor-profile-routing.module';
import {HomeModule} from '../home/home.module';

@NgModule({
  declarations: [MentorProfileComponent],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        MentorProfileComponentRoutingModule,
        HomeModule,
    ],
  providers: []
})
export class MentorProfileModule { }
