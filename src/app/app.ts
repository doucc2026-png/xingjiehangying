import {ChangeDetectionStrategy, Component, signal, inject} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import { ContentService } from './services/content.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, CommonModule],
  template: `
    <!-- Background (Beige/Dark for massive whitespace) -->
    <div class="fixed inset-0 z-[-1] bg-[#faf7f2] dark:bg-[#141210] transition-colors duration-300"></div>

    <!-- Navigation Bar -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-[#faf7f2]/90 dark:bg-[#141210]/90 backdrop-blur-xl border-b border-black/5 dark:border-zinc-800/50 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-10 h-24 flex items-center justify-between">
        <a routerLink="/" class="text-3xl font-black tracking-widest flex items-center gap-3 text-orange-500 hover:text-orange-600 transition-colors">
          <mat-icon class="text-4xl">camera</mat-icon> {{ contentService.settings()?.siteName || '星界航影' }}
        </a>

        <!-- Search Bar -->
        <div class="hidden lg:block relative mx-4">
           <input 
            type="text" 
            placeholder="搜索..." 
            [value]="contentService.searchTerm()"
            (input)="contentService.searchTerm.set(($any($event.target).value))"
            class="px-6 py-2 rounded-full text-sm bg-black/5 dark:bg-white/5 border border-black/5 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-black dark:text-white"
          >
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-8 font-bold tracking-widest text-base">
          <a routerLink="/" routerLinkActive="border-b-4 border-orange-500 text-orange-500" [routerLinkActiveOptions]="{exact: true}" class="text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-500 transition-colors py-2">首页</a>
          <a routerLink="/articles" routerLinkActive="border-b-4 border-orange-500 text-orange-500" class="text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-500 transition-colors py-2">星文</a>
          <a routerLink="/videos" routerLinkActive="border-b-4 border-orange-500 text-orange-500" class="text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-500 transition-colors py-2">星影</a>
          <a routerLink="/images" routerLinkActive="border-b-4 border-orange-500 text-orange-500" class="text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-500 transition-colors py-2">星像</a>
          <a routerLink="/topics" routerLinkActive="border-b-4 border-orange-500 text-orange-500" class="text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-500 transition-colors py-2">专题</a>
          <a routerLink="/about" routerLinkActive="border-b-4 border-orange-500 text-orange-500" class="text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-500 transition-colors py-2">关于我</a>
          <button (click)="toggleTheme()" class="text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-500 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 ml-4 flex items-center justify-center">
             <mat-icon>{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden flex items-center gap-2">
          <button (click)="toggleTheme()" class="p-2 text-gray-400 hover:text-orange-500 rounded-full transition-colors">
            <mat-icon>{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
          <button class="p-3 text-orange-500 hover:bg-orange-50 dark:hover:bg-zinc-800 rounded-full transition-colors" (click)="mobileMenuOpen.set(!mobileMenuOpen())">
            <mat-icon class="text-3xl">{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (mobileMenuOpen()) {
        <div class="md:hidden bg-[#faf7f2] dark:bg-[#141210] border-t border-black/5 dark:border-zinc-800 px-10 py-8 flex flex-col gap-6 shadow-2xl absolute w-full font-bold tracking-widest text-lg transition-colors duration-300 z-50">
          <a routerLink="/" (click)="mobileMenuOpen.set(false)" class="text-gray-400 dark:text-gray-500 hover:text-orange-500 py-2 border-b border-gray-50 dark:border-zinc-800">首页</a>
          <a routerLink="/articles" (click)="mobileMenuOpen.set(false)" class="text-gray-400 dark:text-gray-500 hover:text-orange-500 py-2 border-b border-gray-50 dark:border-zinc-800">星文</a>
          <a routerLink="/videos" (click)="mobileMenuOpen.set(false)" class="text-gray-400 dark:text-gray-500 hover:text-orange-500 py-2 border-b border-gray-50 dark:border-zinc-800">星影</a>
          <a routerLink="/images" (click)="mobileMenuOpen.set(false)" class="text-gray-400 dark:text-gray-500 hover:text-orange-500 py-2 border-b border-gray-50 dark:border-zinc-800">星像</a>
          <a routerLink="/topics" (click)="mobileMenuOpen.set(false)" class="text-gray-400 dark:text-gray-500 hover:text-orange-500 py-2 border-b border-gray-50 dark:border-zinc-800">专题</a>
          <a routerLink="/about" (click)="mobileMenuOpen.set(false)" class="text-gray-400 dark:text-gray-500 hover:text-orange-500 py-2">关于我</a>
        </div>
      }
    </nav>

    <!-- Main Content -->
    <div class="flex flex-col min-h-screen">
      <main class="pt-24 flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer Section -->
      <footer class="border-t border-black/5 dark:border-zinc-900 py-12 bg-[#faf7f2]/50 dark:bg-zinc-950/20 backdrop-blur-md transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-3 text-black dark:text-white">
            <mat-icon class="text-xl">camera</mat-icon>
            <span class="text-sm font-bold tracking-widest uppercase">{{ contentService.settings()?.siteName || '星界航影' }}</span>
          </div>
          
          <div class="text-sm font-black tracking-widest text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-300">
            {{ contentService.settings()?.authorName || 'Jack.Jason' }}
          </div>
          
          <div class="text-xs font-bold tracking-widest text-black dark:text-white font-mono">
            © 2026 {{ contentService.settings()?.siteName || '星界航影' }}
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class App {
  contentService = inject(ContentService);
  mobileMenuOpen = signal(false);
  isDarkMode = signal(false);

  constructor() {
    // Check initial preference
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') || 
                     (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
                     localStorage.getItem('theme') === 'dark';
      this.isDarkMode.set(isDark);
      this.updateTheme();
    }
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', this.isDarkMode() ? 'dark' : 'light');
    }
    this.updateTheme();
  }

  private updateTheme() {
    if (typeof window !== 'undefined') {
      if (this.isDarkMode()) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}
