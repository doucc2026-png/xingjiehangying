import {Routes} from '@angular/router';
import {HomeComponent} from './home';
import {ArticlesComponent} from './articles';
import {VideosComponent} from './videos';
import {ImagesComponent} from './images';
import {AboutComponent} from './about';
import {AdminComponent} from './admin';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'articles', component: ArticlesComponent },
  { path: 'videos', component: VideosComponent },
  { path: 'images', component: ImagesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
