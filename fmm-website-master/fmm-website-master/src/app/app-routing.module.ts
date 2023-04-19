import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from './auth/auth.guard';
import {FirstEntranceGuard} from './core/guards/first-entrance.guard';
import { FaqPageComponent } from './faq-page/faq-page.component';
import { PolicyPageComponent } from './policy/policy-page.component';
import { ClassReviewComponent} from './class-review/class-review.component';

const routes: Routes = [
  // { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'registration',
    loadChildren: () => import('./registration-form/registration-form.module').then( m => m.RegistrationFormModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/edit',
    loadChildren: () => import('./registration-form/registration-form.module').then( m => m.RegistrationFormModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'registration/mentor',
    loadChildren: () => import('./mentor-form/mentor-form.module').then( m => m.MentorFormModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'mentor/edit',
    loadChildren: () => import('./mentor-form/mentor-form.module').then(m => m.MentorFormModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./mentee-profile/mentee-profile.module').then( m => m.MenteeProfileModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'faq',
    component: FaqPageComponent
  },
  {
    path: 'privacypolicy',
    component: PolicyPageComponent
  },
  {
    path: 'class/registration',
    loadChildren: () => import('./class-registration/class-registration.module').then( m => m.ClassRegistrationModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'search',
    loadChildren: () => import('./search/search.module').then( m => m.SearchModule),
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsModule),
  },
  {
    path: '',
    loadChildren: () => import('./home/home.module').then( m => m.HomeModule),
  },
  {
    path: 'profile/mentor',
    loadChildren: () => import('./mentor-profile/mentor-profile.module').then( m => m.MentorProfileModule),
  },
  {
    path: 'profile/mentor/:id',
    loadChildren: () => import('./mentor-profile/mentor-profile.module').then( m => m.MentorProfileModule),
  },
  {
    path: 'dashboard/mentor',
    loadChildren: () => import('./mentor-dashboard/mentor-dashboard.module').then( m => m.MentorDashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'class/:id',
    loadChildren: () => import('./class-landing/class-landing.module').then( m => m.ClassLandingModule),
  },
  {
    path: 'lifetime-report',
    loadChildren: () => import('./lifetime-report/lifetime-report.module').then( m => m.LifetimeReportModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'class/:id/live',
    loadChildren: () => import('./live-class/live-class.module').then( m => m.LiveClassModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'classes',
    loadChildren: () => import('./all-classes/all-classes.module').then( m => m.AllClassesModule),
  },
  {
    path: 'review',
    loadChildren: () => import('./class-review/class-review.module').then( m => m.ClassReviewModule),

  },
  {
    path: 'class-summary',
    loadChildren: () => import('./class-summary/class-summary.module').then( m => m.ClassSummaryModule),

  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
