import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MentorDashboardComponent } from './mentor-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: MentorDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MentorDashboardComponentRoutingModule {}
