import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenteeProfileComponent } from './mentee-profile.component';

const routes: Routes = [
  {
    path: '',
    component: MenteeProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenteeProfileComponentRoutingModule {}
