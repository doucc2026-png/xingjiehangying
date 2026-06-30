import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, CommonModule],
  template: `
    <!-- Background (White for massive whitespace) -->
    <div class="fixed inset-0 z-[-1] bg-white"></div>

    <!-- Navigation Bar -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-10 h-24 flex items-center justify-between">
        <a routerLink="/" class="text-3xl font-black tracking-widest flex items-center gap-3 text-orange-500 hover:text-orange-600 transition-colors">
          <mat-icon class="text-4xl">camera</mat-icon> 星界航影
        </a>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-14 font-bold tracking-widest text-base">
          <a routerLink="/" routerLinkActive="border-b-4 border-orange-500 text-orange-500" [routerLinkActiveOptions]="{exact: true}" class="text-gray-400 hover:text-orange-500 transition-colors py-2">首页</a>
          <a routerLink="/articles" routerLinkActive="border-b-4 border-orange-500 text-orange-500" class="text-gray-400 hover:text-orange-500 transition-colors py-2">星文</a>
          <a routerLink="/videos" routerLinkActive="border-b-4 border-orange-500 text-orange-500" class="text-gray-400 hover:text-orange-500 transition-colors py-2">星影</a>
          <a routerLink="/images" routerLinkActive="border-b-4 border-orange-500 text-orange-500" class="text-gray-400 hover:text-orange-500 transition-colors py-2">星像</a>
          <a routerLink="/about" routerLinkActive="border-b-4 border-orange-500 text-orange-500" class="text-gray-400 hover:text-orange-500 transition-colors py-2">关于我</a>
        </div>

        <!-- Mobile Menu Button -->
        <button class="md:hidden p-3 text-orange-500 hover:bg-orange-50 rounded-full transition-colors" (click)="mobileMenuOpen.set(!mobileMenuOpen())">
          <mat-icon class="text-3xl">{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
        </button>
      </div>

      <!-- Mobile Menu -->
      @if (mobileMenuOpen()) {
        <div class="md:hidden bg-white border-t border-gray-100 px-10 py-8 flex flex-col gap-6 shadow-2xl absolute w-full font-bold tracking-widest text-lg">
          <a routerLink="/" (click)="mobileMenuOpen.set(false)" class="text-gray-400 hover:text-orange-500 py-2 border-b border-gray-50">首页</a>
          <a routerLink="/articles" (click)="mobileMenuOpen.set(false)" class="text-gray-400 hover:text-orange-500 py-2 border-b border-gray-50">星文</a>
          <a routerLink="/videos" (click)="mobileMenuOpen.set(false)" class="text-gray-400 hover:text-orange-500 py-2 border-b border-gray-50">星影</a>
          <a routerLink="/images" (click)="mobileMenuOpen.set(false)" class="text-gray-400 hover:text-orange-500 py-2 border-b border-gray-50">星像</a>
          <a routerLink="/about" (click)="mobileMenuOpen.set(false)" class="text-gray-400 hover:text-orange-500 py-2">关于我</a>
        </div>
      }
    </nav>

    <!-- Main Content -->
    <main class="pt-24 min-h-screen">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class App {
  mobileMenuOpen = signal(false);
}
