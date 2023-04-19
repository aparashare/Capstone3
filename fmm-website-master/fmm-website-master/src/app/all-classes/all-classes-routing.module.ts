import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AllClassesComponent } from './all-classes.component';

const routes: Routes = [
  {
    path: '',
    component: AllClassesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AllClassesComponentRoutingModule {}
