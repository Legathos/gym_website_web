import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {NgOptimizedImage} from "@angular/common";
import { LoginComponent } from './login/login.component';


@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    NavBarComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    NgOptimizedImage
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
