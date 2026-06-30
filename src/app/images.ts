import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from './services/content.service';
import { MatIconModule } from '@angular/material/icon';
import { animate, stagger } from 'motion';

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="max-w-[1600px] mx-auto px-8 lg:px-24 py-32">
      <div class="mb-32 page-header flex flex-col items-center">
        <div class="w-24 h-24 bg-pink-50 text-pink-500 rounded-3xl flex items-center justify-center mb-8 shadow-sm transform -rotate-3">
          <mat-icon class="text-5xl">photo_camera</mat-icon>
        </div>
        <h1 class="text-6xl font-black tracking-widest mb-6 text-black drop-shadow-sm">星像</h1>
        <p class="text-xl text-gray-500 font-bold tracking-widest">定格瞬间 <span class="text-pink-500 mx-2">·</span> 永恒记忆</p>
      </div>

      @if (contentService.loading()) {
        <div class="flex justify-center items-center py-40">
          <mat-icon class="animate-spin text-6xl text-pink-500">sync</mat-icon>
        </div>
      } @else {
        <div class="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-12">
          @for (item of contentService.contents(); track item.id) {
            <div class="photo-frame break-inside-avoid relative group cursor-pointer border-0">
              <div class="overflow-hidden bg-gray-50 rounded-2xl relative">
                <img [src]="item.thumbnailUrl || item.fileUrl" [alt]="item.title" class="w-full h-auto transform group-hover:scale-105 transition-transform duration-700" referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="absolute bottom-0 left-0 right-0 p-8 text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span class="text-xs font-bold bg-pink-500/80 text-white px-3 py-1 rounded-full tracking-widest mb-3 inline-block shadow-sm backdrop-blur-md">星像</span>
                  <h3 class="text-2xl font-bold tracking-wider mb-2 drop-shadow-md">{{ item.title }}</h3>
                  <p class="text-sm text-gray-200 font-medium line-clamp-2 drop-shadow-md">{{ item.description }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ImagesComponent implements OnInit {
  contentService = inject(ContentService);

  constructor() {
    effect(() => {
      if (this.contentService.contents().length > 0) {
        setTimeout(() => {
          animate('.page-header', { opacity: [0, 1], y: [-30, 0] }, { duration: 0.8, ease: 'easeOut' });
          const cards = document.querySelectorAll('.photo-frame');
          if (cards.length) {
            animate(cards, { opacity: [0, 1], scale: [0.95, 1] }, { delay: stagger(0.15), duration: 0.8, ease: 'easeOut' });
          }
        }, 50);
      }
    });
  }

  ngOnInit() {
    this.contentService.loadContents('image');
  }
}
