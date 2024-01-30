import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocalStorageService } from '@domain/local-storage';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    LocalStorageService
  ]
})

export class LocalStorageDomainModule { }
