import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClassLandingComponent } from './class-landing.component';

const routes: Routes = [
  {
    path: '',
    component: ClassLandingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassLandingComponentRoutingModule {}
