import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import {MaterialModule} from '../material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HomeComponentRoutingModule} from './home-routing.module';
import {CoreModule} from '../core/core.module';
import { FillPipe } from './fill.pipe';
import { CarouselModule } from 'ngx-owl-carousel-o';
@NgModule({
  declarations: [HomeComponent, FillPipe],
  exports: [
    FillPipe
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HomeComponentRoutingModule,
    CoreModule,
    CarouselModule
  ]
})
export class HomeModule { }
