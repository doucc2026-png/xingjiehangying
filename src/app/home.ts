import { Component, inject, OnInit, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, AppContent } from './services/content.service';
import { MatIconModule } from '@angular/material/icon';
import { animate, stagger } from 'motion';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="relative w-full min-h-screen">
      <!-- Background Image -->
      @if (backgroundImageUrl()) {
        <div class="absolute top-0 left-0 w-full h-[80vh] z-0 overflow-hidden">
          <img [src]="backgroundImageUrl()" class="w-full h-full object-cover" alt="Background" referrerpolicy="no-referrer">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div class="absolute bottom-0 w-full h-40 bg-gradient-to-t from-[#f8fafc] to-transparent"></div>
        </div>
      }

      <div class="max-w-[1600px] mx-auto px-8 lg:px-24 py-32 relative z-10">
        <div class="text-center mb-32 hero-section h-[40vh] flex flex-col justify-center items-center">
          <h1 class="text-6xl md:text-9xl font-black tracking-tighter mb-8 drop-shadow-2xl" [ngClass]="backgroundImageUrl() ? 'text-white' : 'text-black'">探索世界</h1>
          <p class="text-2xl md:text-3xl font-bold tracking-widest max-w-3xl mx-auto drop-shadow-lg mb-10" [ngClass]="backgroundImageUrl() ? 'text-gray-100' : 'text-gray-800'">
            欢迎来到星界航影，记录生活，分享每一个值得被看见的瞬间。
          </p>
        </div>

        @if (contentService.loading()) {
          <div class="flex justify-center items-center py-40">
            <mat-icon class="animate-spin text-6xl text-orange-500">sync</mat-icon>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            @for (item of displayContents(); track item.id) {
              <div class="photo-frame flex flex-col group cursor-pointer">
                
                <!-- Media Player / Viewer -->
                <div class="overflow-hidden bg-gray-50 rounded-[16px] relative mb-6 h-80 flex items-center justify-center shadow-sm hover:shadow-xl transition-shadow">
                  @if (item.type === 'video') {
                    @if (item.thumbnailUrl) {
                      <img [src]="item.thumbnailUrl" class="w-full h-full object-cover" alt="Video Thumbnail" referrerpolicy="no-referrer">
                    } @else {
                      <div class="w-full h-full bg-black"></div>
                    }
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    <mat-icon class="absolute text-white text-7xl drop-shadow-2xl z-10 pointer-events-none transform group-hover:scale-110 transition-transform">play_circle_filled</mat-icon>
                  } @else if (item.type === 'image') {
                    <img [src]="item.thumbnailUrl || item.fileUrl" [alt]="item.title" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" referrerpolicy="no-referrer">
                  } @else {
                    <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col justify-center items-center p-10 text-center transform group-hover:scale-105 transition-transform duration-700">
                      <mat-icon class="text-blue-200 text-8xl mb-6">menu_book</mat-icon>
                      <p class="text-gray-800 font-medium line-clamp-4 text-lg leading-relaxed">{{ item.content }}</p>
                    </div>
                  }
                </div>

                <!-- Content Info -->
                <div class="px-2 pb-2 flex flex-col flex-1">
                  <div class="flex items-center justify-between mb-4">
                    <span class="text-sm font-bold px-4 py-1.5 rounded-full tracking-widest shadow-sm"
                          [ngClass]="{
                            'bg-orange-100 text-orange-600': item.type === 'video',
                            'bg-blue-100 text-blue-600': item.type === 'article',
                            'bg-pink-100 text-pink-600': item.type === 'image'
                          }">
                      {{ item.type === 'article' ? '星文' : (item.type === 'video' ? '星影' : '星像') }}
                    </span>
                    <span class="text-sm text-gray-400 font-bold tracking-wider">{{ item.createdAt | date:'yyyy.MM.dd' }}</span>
                  </div>
                  <h3 class="text-2xl font-black mb-3 tracking-wide text-black">{{ item.title }}</h3>
                  <p class="text-gray-500 text-base line-clamp-2 leading-relaxed font-medium">{{ item.description }}</p>
                </div>

              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  contentService = inject(ContentService);

  displayContents = computed(() => {
    return this.contentService.filteredContents().filter((c: AppContent) => c.type !== 'background');
  });

  backgroundImageUrl = computed(() => {
    const bg = this.contentService.contents().find(c => c.type === 'background');
    return bg ? bg.fileUrl : null;
  });

  constructor() {
    effect(() => {
      const contents = this.displayContents();
      if (contents.length >= 0) { // animate even if 0 if loaded
        setTimeout(() => {
          const hero = document.querySelector('.hero-section');
          if (hero) {
            animate(
              hero,
              { opacity: [0, 1], y: [40, 0] },
              { duration: 1, ease: 'easeOut' }
            );
          }
          
          const cards = document.querySelectorAll('.photo-frame');
          if (cards.length) {
            animate(
              cards,
              { opacity: [0, 1], y: [50, 0] },
              { delay: stagger(0.15), duration: 0.8, ease: 'easeOut' }
            );
          }
        }, 50);
      }
    });
  }

  ngOnInit() {
    this.contentService.loadContents();
  }
}
