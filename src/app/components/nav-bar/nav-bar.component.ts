import {Component, OnInit} from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {JwtServiceService} from "../../services/jwt-service.service";
import {ActivatedRoute, NavigationExtras, Router} from "@angular/router";
import {User} from "../../../data/user.data";
import {MemberService} from "../../services/member.service";
import {DialogComponent} from "../dialog/dialog.component";
import { MatDialog } from '@angular/material/dialog';
import {UserLogin} from "../../../data/userlogin.data";
import {GlobalConstants} from "../../../data/global-constraints.data";

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit {
  username!: string;
  user!: User;
  userId!:number;
  private userRole!: string;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private jwtService: JwtServiceService,
              private cookieService: CookieService,
              private dialog: MatDialog,
              private memberService: MemberService) {
  }

  ngOnInit(): void {
      this.username = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).username;
      this.userRole = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).role;
  }

  navigate(url:string) {
    const baseUrl = "http://localhost:4200/"
    let navigationExtras: NavigationExtras = {};
    if (this.userRole === 'MEMBER') {
      navigationExtras.queryParams = { role: 'member' };
      this.router.navigateByUrl(baseUrl+url, navigationExtras);
    }
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
