import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LifetimeReportComponent } from './lifetime-report.component';

const routes: Routes = [
  {
    path: '',
    component: LifetimeReportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LifetimeReportComponentRoutingModule {}
