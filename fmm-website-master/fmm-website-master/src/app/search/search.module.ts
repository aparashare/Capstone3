import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { FiltersComponent } from './filters/filters.component';
import {SearchComponentRoutingModule} from './search-routing.module';
import {MaterialModule} from '../material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Ng5SliderModule} from 'ng5-slider';

@NgModule({
  declarations: [SearchComponent, FiltersComponent],
  imports: [
    CommonModule,
    SearchComponentRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    Ng5SliderModule
  ]
})
export class SearchModule { }
