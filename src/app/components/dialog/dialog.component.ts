import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {RequestsService} from "../../services/requests.service";

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  question: string = '';
  action: string = '';

  constructor(public activeModal: NgbActiveModal, private router: Router, private cookieService: CookieService, public dialogRef: MatDialogRef<DialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private requestsService: RequestsService) { }

  ngOnInit(): void {
    this.question = this.data.question;
    this.action = this.data.action;
  }

  logout() {
    this.cookieService.deleteAll();
    this.router.navigateByUrl('login');
    this.close()
  }

  close() {
    this.dialogRef.close();
  }
}
