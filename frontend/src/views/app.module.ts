import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { ServiceRegistry } from '../core/di/di.module.js';
import { GlobalErrorService } from '../core/global-error.service.js';
import { WinBoxService } from '../core/winbox.service.js';

@NgModule({
  imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule],
  providers: [
    ServiceRegistry,
    GlobalErrorService,
    WinBoxService,
  ],
})
export class AppModule {}
