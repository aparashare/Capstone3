import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifetimeReportComponent } from './lifetime-report.component';
import {LifetimeReportComponentRoutingModule} from './lifetime-report-routing.module';
import {MaterialModule} from '../material.module';
import {ChartsModule} from 'ng2-charts';



@NgModule({
  declarations: [LifetimeReportComponent],
  imports: [
    CommonModule,
    LifetimeReportComponentRoutingModule,
    MaterialModule,
    ChartsModule
  ]
})
export class LifetimeReportModule { }
