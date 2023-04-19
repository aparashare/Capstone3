import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllClassesComponent } from './all-classes.component';
import {MaterialModule} from '../material.module';
import {AllClassesComponentRoutingModule} from './all-classes-routing.module';

@NgModule({
  declarations: [AllClassesComponent],
  imports: [
    CommonModule,
    AllClassesComponentRoutingModule,
    MaterialModule,
  ]
})
export class AllClassesModule { }
