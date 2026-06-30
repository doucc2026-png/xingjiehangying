import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app/app';
import {appConfig} from './app/app.config';
import {inject} from '@vercel/analytics';

// Initialize Vercel Web Analytics
inject();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
