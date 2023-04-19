import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import {CoreModule} from './core/core.module';
import {MaterialModule} from './material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatToolbarModule} from '@angular/material/toolbar';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {TokenInterceptor} from './auth/token-interceptor';
import {Ng5SliderModule} from 'ng5-slider';
import {LoginComponent} from './login/login.component';
import { ChartsModule } from 'ng2-charts';
import {VideoDialogComponent} from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { RequestPasswordComponent } from './request-password/request-password.component';
import {ErrorInterceptor} from './auth/error.interceptor';
import {ErrorService} from './auth/error.service';
import { FaqPageComponent } from './faq-page/faq-page.component';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import {MatSliderModule} from '@angular/material/slider';
import { LoaderService } from './core/services/loader.service';
import { LoaderInterceptor } from './core/services/loader-interceptor.service';
import { MyLoaderComponent } from './core/loaderComponent/my-loader-component';
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    VideoDialogComponent,
    RegisterComponent,
    RequestPasswordComponent,
    FaqPageComponent,
    MyLoaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    CoreModule,
    Ng5SliderModule,
    ChartsModule,
    MatSliderModule,
    ScrollToModule.forRoot()
  ],
  providers: [
    ErrorService,
    LoaderService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
       multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
