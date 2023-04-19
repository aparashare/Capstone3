import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenteeProfileComponent } from './mentee-profile.component';
import {MenteeProfileComponentRoutingModule} from './mentee-profile-routing.module';

@NgModule({
  declarations: [MenteeProfileComponent],
  imports: [
    CommonModule,
    MenteeProfileComponentRoutingModule,
  ]
})
export class MenteeProfileModule { }
