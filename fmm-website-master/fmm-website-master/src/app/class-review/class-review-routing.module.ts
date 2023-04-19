import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClassReviewComponent } from './class-review.component';

const routes: Routes = [
  {
    path: '',
    component: ClassReviewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassReviewComponentRoutingModule {}
