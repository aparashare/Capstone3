import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MentorFormComponent } from './mentor-form.component';

const routes: Routes = [
  {
    path: '',
    component: MentorFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MentorFormComponentRoutingModule {}
