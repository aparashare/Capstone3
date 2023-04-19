import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassRegistrationComponent } from './class-registration.component';
import {MaterialModule} from '../material.module';
import {ClassRegistrationComponentRoutingModule} from './class-registration-routing.module';
import {FormsModule,ReactiveFormsModule} from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';




@NgModule({
  declarations: [ClassRegistrationComponent],
    imports: [
        CommonModule,
        ClassRegistrationComponentRoutingModule,
        MaterialModule,
        ReactiveFormsModule,
        AngularEditorModule,
        FormsModule
    ]
})
export class ClassRegistrationModule { }
