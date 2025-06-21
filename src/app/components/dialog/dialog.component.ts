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
  weight: number | null = null;
  isWeightInput: boolean = false;
  weightError: string = '';

  constructor( private router: Router, private cookieService: CookieService, public dialogRef: MatDialogRef<DialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.question = this.data.question;
    this.action = this.data.action;
    this.isWeightInput = this.data.isWeightInput || false;
  }

  logout() {
    // Delete only the authentication cookie instead of all cookies
    this.cookieService.delete("auth-cookie", "/");
    this.router.navigateByUrl('login');
    this.close();
  }

  delete() {
    // Close the dialog and return appropriate data
    if (this.isWeightInput && this.weight !== null) {
      // Validate weight is within the allowed range (0-400)
      if (this.weight < 0 || this.weight > 400) {
        this.weightError = 'Weight must be between 0 and 400 kg';
        return; // Don't close the dialog
      }

      // For weight input dialogs, return the weight value
      this.dialogRef.close({ weight: this.weight });
    } else {
      // For other dialogs, return true to indicate confirmation
      this.dialogRef.close(true);
    }
  }

  close() {
    // Close the dialog and return false to indicate cancellation
    this.dialogRef.close(false);
  }

  onWeightChange() {
    // Clear error message when user changes the weight
    this.weightError = '';
  }
}
