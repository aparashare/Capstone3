import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassSummaryComponent } from './class-summary.component';
import {MaterialModule} from '../material.module';
import {ClassSummaryComponentRoutingModule} from './class-summary-routing.module';
import { FormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ChartsModule } from 'ng2-charts'

@NgModule({
  declarations: [ClassSummaryComponent],
    imports: [
        CommonModule,
        ClassSummaryComponentRoutingModule,
        MaterialModule,
        FormsModule,
        AngularEditorModule,
        ChartsModule
    ]
})
export class ClassSummaryModule { }
