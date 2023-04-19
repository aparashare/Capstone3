import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveClassComponent } from './live-class.component';
import {MaterialModule} from '../material.module';
import {LiveClassComponentRoutingModule} from './live-class-routing.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FormsModule } from '@angular/forms';
import { AngularDraggableModule } from 'angular2-draggable';
import { AngularEditorModule } from '@kolkov/angular-editor';


@NgModule({
  declarations: [LiveClassComponent],
    imports: [
        CommonModule,
        LiveClassComponentRoutingModule,
        MaterialModule,
        InfiniteScrollModule,
        FormsModule,
        AngularDraggableModule,
        AngularEditorModule
    ]
})
export class LiveClassModule { }
