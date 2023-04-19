import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassLandingComponent } from './class-landing.component';
import {MaterialModule} from '../material.module';
import {ClassLandingComponentRoutingModule} from './class-landing-routing.module';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [ClassLandingComponent, PaymentDialogComponent],
  imports: [
    CommonModule,
    ClassLandingComponentRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
  ]
})
export class ClassLandingModule { }
