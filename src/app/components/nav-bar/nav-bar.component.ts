import {Component, OnInit} from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {JwtService} from "@core/auth";
import {NavigationExtras, Router, NavigationEnd} from "@angular/router";
import {DialogComponent} from "../dialog/dialog.component";
import { MatDialog } from '@angular/material/dialog';
import { User } from '@domain/user';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})

export class NavBarComponent implements OnInit {
  username!: string;
  user!: User;
  showNavBar = !(window.location.href.includes('login')
    || window.location.href.includes('change-password')
    || window.location.href.includes("register")
    || window.location.href.includes('landing-page'));
  private userRole!: string;
  currentRoute: string = '';

  constructor(private router: Router,
              private jwtService: JwtService,
              private cookieService: CookieService,
              private dialog: MatDialog) {
    // Subscribe to router events to track the current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });
  }

  ngOnInit(): void {
    this.username = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).username;
    this.userRole = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).roles;
    // Set initial route
    this.currentRoute = this.router.url;
  }

  // Method to check if a route is active
  isRouteActive(route: string): boolean {
    if (route === '/home' && this.currentRoute === '/') {
      return true;
    }
    return this.currentRoute.includes(route);
  }

  tabClick(tab: any) {
    switch(tab.index){
      case 0: this.navigate('landing-page');
        break;
      case 1: this.navigate('food-tracker/');
        break;
      case 2: this.navigate('profile/');
        break;
      case 3: this.navigate('food');
        break;
    }
  }

  navigate(url:string) {
    let navigationExtras: NavigationExtras = {};
    if (this.userRole === 'MEMBER') {
      navigationExtras.queryParams = { role: 'member' };
      if(url.endsWith("/")){
        this.router.navigateByUrl(url+this.username, navigationExtras);
      }
      this.router.navigateByUrl(url, navigationExtras);

    }
    this.closeNavbar();
  }

  closeNavbar() {
    // This method is kept for compatibility with existing code
    // Bootstrap's fixed-bottom navbar doesn't have a toggler in our implementation
    const navbarToggler = document.querySelector('.navbar-toggler') as HTMLElement;
    if (navbarToggler) {
      navbarToggler.click();
    }
  }

  openDialog() {
    this.dialog.open(DialogComponent, {
      data: { question: 'Are you sure you want to log out?', action: 'Log out' }
    });
  }

}
