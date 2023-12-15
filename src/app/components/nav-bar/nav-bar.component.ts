import {Component, OnInit} from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {JwtServiceService} from "../../services/jwt-service.service";
import {ActivatedRoute, Router} from "@angular/router";
import {User} from "../../../data/user.data";
import {MemberService} from "../../services/member.service";
import {DialogComponent} from "../dialog/dialog.component";
import { MatDialog } from '@angular/material/dialog';


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
    this.route.queryParams.subscribe((queryParams) => {
      this.userRole = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).roles;
      this.username = this.jwtService.parseJwt(this.cookieService.get("auth-cookie")).username;
      this.memberService.getUserByUsername(this.username)
        .subscribe({
          next: (user: User) => {
            console.log('User details:', user);
            this.user = user;
            this.userId=user.id;
          },
          error: (error: any) => {
            console.error('Error fetching user details:', error);
            // Handle the error
          },
        });
    });
  }
  logout() {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('token');
      this.router.navigateByUrl('login');
    }
  }

  closeNavbar() {
    // Use JavaScript to close the Bootstrap navbar
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
