import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import {MaterialModule} from '../material.module';
import {SettingsComponentRoutingModule} from './settings-routing.module';



@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    SettingsComponentRoutingModule,
    MaterialModule
  ]
})
export class SettingsModule { }
