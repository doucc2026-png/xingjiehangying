import { Component, inject, OnInit, signal, effect, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ContentService, AppContent } from './services/content.service';
import { MatIconModule } from '@angular/material/icon';
import { animate, stagger } from 'motion';

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="max-w-[1600px] mx-auto px-8 lg:px-24 py-24">
      <div class="mb-20">
        <h1 class="text-7xl font-black tracking-tighter mb-4 text-black">深度专题</h1>
        <p class="text-xl text-gray-400 font-bold tracking-widest uppercase">Special Topics / In-depth Exploration</p>
      </div>

      @if (contentService.loading()) {
        <div class="flex justify-center py-40">
          <mat-icon class="animate-spin text-6xl text-green-500">sync</mat-icon>
        </div>
      } @else if (topics().length === 0) {
        <div class="py-40 text-center text-gray-300">
           <mat-icon class="text-8xl mb-4">auto_stories</mat-icon>
           <p class="text-2xl font-bold tracking-widest">暂无专题内容</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-32">
          @for (topic of topics(); track topic.id) {
            <div class="topic-item flex flex-col lg:flex-row gap-16 items-center">
              <div class="lg:w-1/2 rounded-[40px] overflow-hidden shadow-2xl relative group">
                <img [src]="topic.fileUrl || 'https://picsum.photos/seed/' + topic.id + '/800/600'" class="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-1000" alt="Topic Cover" referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
                   <span class="bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase w-fit mb-4">Topic</span>
                   <h2 class="text-4xl font-black text-white mb-2">{{ topic.title }}</h2>
                </div>
              </div>
              <div class="lg:w-1/2 flex flex-col justify-center">
                <div class="w-20 h-2 bg-green-500 mb-8"></div>
                <p class="text-2xl text-gray-800 font-medium leading-relaxed mb-8">{{ topic.description }}</p>
                <div class="bg-gray-50 p-10 rounded-[32px] border border-gray-100">
                   <p class="text-gray-600 leading-loose whitespace-pre-wrap">{{ topic.content }}</p>
                </div>
                <div class="mt-8 flex items-center gap-4 text-gray-400 font-bold tracking-widest text-sm uppercase">
                   <mat-icon>calendar_today</mat-icon>
                   {{ topic.createdAt | date:'longDate' }}
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class TopicsComponent implements OnInit {
  contentService = inject(ContentService);
  private platformId = inject(PLATFORM_ID);

  topics = signal<AppContent[]>([]);

  constructor() {
    effect(() => {
      if (this.topics().length > 0 && isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          const items = document.querySelectorAll('.topic-item');
          if (items.length) {
            animate(
              items,
              { opacity: [0, 1], y: [60, 0] },
              { delay: stagger(0.2), duration: 1, ease: [0.22, 1, 0.36, 1] }
            );
          }
        }, 50);
      }
    });
  }

  async ngOnInit() {
    await this.contentService.loadContents('topic');
    this.topics.set(this.contentService.contents());
  }
}
