import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  question: string = '';
  action: string = '';

  constructor( private router: Router, private cookieService: CookieService, public dialogRef: MatDialogRef<DialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.question = this.data.question;
    this.action = this.data.action;
  }

  logout() {
    // Delete only the authentication cookie instead of all cookies
    this.cookieService.delete("auth-cookie", "/");
    this.router.navigateByUrl('login');
    this.close();
  }

  close() {
    this.dialogRef.close();
  }
}
