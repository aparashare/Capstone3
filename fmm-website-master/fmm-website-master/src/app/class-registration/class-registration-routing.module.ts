import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClassRegistrationComponent } from './class-registration.component';

const routes: Routes = [
  {
    path: '',
    component: ClassRegistrationComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassRegistrationComponentRoutingModule {}
