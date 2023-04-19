import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MentorDashboardComponent } from './mentor-dashboard.component';
import {MaterialModule} from '../material.module';
import {MentorDashboardComponentRoutingModule} from './mentor-dashboard-routing.module';
import {ChartsModule} from 'ng2-charts';



@NgModule({
  declarations: [MentorDashboardComponent],
    imports: [
        CommonModule,
        MentorDashboardComponentRoutingModule,
        MaterialModule,
        ChartsModule,
    ]
})
export class MentorDashboardModule { }
