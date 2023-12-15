import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';
import { RequestsService} from "../../services/requests.service";


@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  question: string = '';
  action: string = '';
  @Input() eventIdCancel = new Number();

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
