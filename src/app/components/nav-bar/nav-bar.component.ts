import {Component, OnInit} from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {JwtServiceService} from "../../services/jwt-service.service";
import {ActivatedRoute, Router} from "@angular/router";
import {RequestsService} from "../../services/requests.service";
import {User} from "../../../data/user.data";
import {Observable} from "rxjs";
import {MemberService} from "../../services/member.service";

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

}
