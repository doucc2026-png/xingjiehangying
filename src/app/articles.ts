import { Component, inject, OnInit, effect, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ContentService } from './services/content.service';
import { MatIconModule } from '@angular/material/icon';
import { animate, stagger } from 'motion';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="max-w-4xl mx-auto px-8 lg:px-12 py-32">
      <div class="mb-32 page-header flex flex-col items-center">
        <div class="w-24 h-24 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mb-8 shadow-sm transform -rotate-6">
          <mat-icon class="text-5xl">auto_stories</mat-icon>
        </div>
        <h1 class="text-6xl font-black tracking-widest mb-6 text-black drop-shadow-sm">星文</h1>
        <p class="text-xl text-gray-500 font-bold tracking-widest">文字温度 <span class="text-blue-500 mx-2">·</span> 思想深度</p>
      </div>

      @if (contentService.loading()) {
        <div class="flex justify-center items-center py-40">
          <mat-icon class="animate-spin text-6xl text-blue-500">sync</mat-icon>
        </div>
      } @else {
        <div class="flex flex-col gap-24">
          @for (item of contentService.contents(); track item.id) {
            <article class="article-item bg-white rounded-[40px] p-12 md:p-20 shadow-[0_10px_50px_-10px_rgba(0,0,0,0.05)] border border-gray-50 relative overflow-hidden group">
              <div class="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-400 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out"></div>
              
              <div class="mb-12">
                <div class="flex items-center gap-4 mb-8">
                  <span class="text-sm font-bold bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full tracking-widest shadow-sm">星文</span>
                  <time class="text-sm text-gray-400 font-bold tracking-widest">{{ item.createdAt | date:'yyyy.MM.dd' }}</time>
                </div>
                
                <h2 class="text-4xl md:text-5xl font-black mb-8 tracking-wide text-black leading-tight">{{ item.title }}</h2>
                
                @if (item.description) {
                  <div class="p-8 bg-gray-50 rounded-2xl border-l-4 border-blue-500">
                    <p class="text-xl text-gray-600 font-medium italic tracking-wide leading-relaxed">"{{ item.description }}"</p>
                  </div>
                }
              </div>
              
              <div class="text-gray-800 text-xl leading-[2.5] font-medium whitespace-pre-wrap">{{ item.content }}</div>
            </article>
          }
        </div>
      }
    </div>
  `
})
export class ArticlesComponent implements OnInit {
  contentService = inject(ContentService);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      if (this.contentService.contents().length > 0 && isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          animate('.page-header', { opacity: [0, 1], y: [-30, 0] }, { duration: 0.8, ease: 'easeOut' });
          const cards = document.querySelectorAll('.article-item');
          if (cards.length) {
            animate(cards, { opacity: [0, 1], y: [60, 0] }, { delay: stagger(0.2), duration: 0.8, ease: 'easeOut' });
          }
        }, 50);
      }
    });
  }

  ngOnInit() {
    this.contentService.loadContents('article');
  }
}
