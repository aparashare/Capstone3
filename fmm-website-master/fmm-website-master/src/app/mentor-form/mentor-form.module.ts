import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MentorFormComponent } from './mentor-form.component';
import {MaterialModule} from '../material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MentorFormComponentRoutingModule} from './mentor-form-routing.module';
import {CoreModule} from '../core/core.module';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

@NgModule({
  declarations: [MentorFormComponent],
    imports: [
        CommonModule,
        MentorFormComponentRoutingModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        CoreModule,
        MatAutocompleteModule,
    ]
})
export class MentorFormModule { }
