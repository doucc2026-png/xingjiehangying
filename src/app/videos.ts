import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from './services/content.service';
import { MatIconModule } from '@angular/material/icon';
import { animate, stagger } from 'motion';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="max-w-[1400px] mx-auto px-8 lg:px-24 py-32">
      <div class="mb-32 page-header flex flex-col items-center">
        <div class="w-24 h-24 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mb-8 shadow-sm transform rotate-6">
          <mat-icon class="text-5xl">movie_creation</mat-icon>
        </div>
        <h1 class="text-6xl font-black tracking-widest mb-6 text-black drop-shadow-sm">星影</h1>
        <p class="text-xl text-gray-500 font-bold tracking-widest">流动光影 <span class="text-orange-500 mx-2">·</span> 真实记录</p>
      </div>

      @if (contentService.loading()) {
        <div class="flex justify-center items-center py-40">
          <mat-icon class="animate-spin text-6xl text-orange-500">sync</mat-icon>
        </div>
      } @else {
        <div class="flex flex-col gap-24">
          @for (item of contentService.contents(); track item.id) {
            <div class="video-item flex flex-col lg:flex-row gap-16 items-center">
              <div class="w-full lg:w-3/5 bg-gray-50 aspect-video relative flex-shrink-0 rounded-[32px] overflow-hidden shadow-2xl">
                <video [src]="item.fileUrl" controls class="w-full h-full object-contain bg-black" preload="metadata"></video>
              </div>
              <div class="w-full lg:w-2/5 flex flex-col justify-center">
                <div class="flex items-center gap-4 mb-6">
                  <span class="text-sm font-bold bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full tracking-widest shadow-sm">星影</span>
                  <span class="text-sm text-gray-400 font-bold tracking-widest">{{ item.createdAt | date:'yyyy.MM.dd' }}</span>
                </div>
                <h3 class="text-4xl lg:text-5xl font-black mb-8 tracking-wide text-black leading-tight">{{ item.title }}</h3>
                <p class="text-gray-600 text-lg leading-relaxed font-medium">{{ item.description }}</p>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class VideosComponent implements OnInit {
  contentService = inject(ContentService);

  constructor() {
    effect(() => {
      if (this.contentService.contents().length > 0) {
        setTimeout(() => {
          animate('.page-header', { opacity: [0, 1], y: [30, 0] }, { duration: 0.8, ease: 'easeOut' });
          const cards = document.querySelectorAll('.video-item');
          if (cards.length) {
            animate(cards, { opacity: [0, 1], x: [-50, 0] }, { delay: stagger(0.2), duration: 0.8, ease: 'easeOut' });
          }
        }, 50);
      }
    });
  }

  ngOnInit() {
    this.contentService.loadContents('video');
  }
}
