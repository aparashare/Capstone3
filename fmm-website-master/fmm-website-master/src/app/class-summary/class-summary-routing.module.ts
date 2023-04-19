import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClassSummaryComponent } from './class-summary.component';

const routes: Routes = [
  {
    path: '',
    component: ClassSummaryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassSummaryComponentRoutingModule {}
