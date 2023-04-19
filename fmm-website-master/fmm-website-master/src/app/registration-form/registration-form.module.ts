import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationFormComponent } from './registration-form.component';
import {MaterialModule} from '../material.module';
import {RegistrationFormComponentRoutingModule} from './registration-form-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CoreModule} from '../core/core.module';

@NgModule({
  declarations: [RegistrationFormComponent],
    imports: [
        CommonModule,
        MaterialModule,
        RegistrationFormComponentRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        CoreModule,
    ]
})
export class RegistrationFormModule { }
