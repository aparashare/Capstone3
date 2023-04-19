import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassReviewComponent } from './class-review.component';
import {MaterialModule} from '../material.module';
import {ClassReviewComponentRoutingModule} from './class-review-routing.module';
import { FormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';


@NgModule({
  declarations: [ClassReviewComponent],
    imports: [
        CommonModule,
        ClassReviewComponentRoutingModule,
        MaterialModule,
        FormsModule,
        AngularEditorModule
    ]
})
export class ClassReviewModule { }
