import {Component, OnInit} from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {JwtService} from "@core/auth";
import {NavigationExtras, Router} from "@angular/router";
import {DialogComponent} from "../dialog/dialog.component";
import { MatDialog } from '@angular/material/dialog';
import { User } from '@domain/user';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})

export class NavBarComponent implements OnInit {
  username!: string;
  user!: User;
  private userRole!: string;

  constructor(private router: Router,
              private jwtService: JwtService,
              private cookieService: CookieService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.username = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).username;
    this.userRole = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).roles;
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
