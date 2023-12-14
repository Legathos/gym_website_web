import {Component} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'gym_website_web';
  showNavBar: boolean = false;

  constructor(private router: Router) {

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.showNavBar = !(window.location.href.includes('login') || window.location.href.includes('change-password') || window.location.href.includes("register"));
      }
    })

  }
}
