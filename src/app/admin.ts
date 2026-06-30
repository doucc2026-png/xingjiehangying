import { Component, inject, OnInit, signal, effect, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContentService, AppContent, AppStats } from './services/content.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="max-w-6xl mx-auto py-12 px-6 admin-container min-h-screen">
      @if (!isAuthenticated()) {
        <div class="max-w-md mx-auto mt-20 glass-panel p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <mat-icon class="text-6xl text-black mb-4">admin_panel_settings</mat-icon>
          <h1 class="text-2xl font-bold mb-6">管理后台登录</h1>
          <form (submit)="login($event)" class="flex flex-col gap-4">
            <input type="password" [(ngModel)]="password" name="password" placeholder="请输入管理员密码" class="p-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition-all text-center tracking-widest">
            <button type="submit" class="bg-black text-white p-4 rounded-xl font-medium hover:bg-gray-800 transition-all">登录</button>
          </form>
          <p class="text-xs text-gray-400 mt-4">默认密码: admin123</p>
        </div>
      } @else {
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-3xl font-black tracking-tighter flex items-center gap-3">
            <mat-icon class="text-4xl text-orange-500">dashboard_customize</mat-icon>
            星界航影 <span class="text-gray-300 mx-1">/</span> 管理控制台
          </h1>
          <div class="flex gap-4">
            <button (click)="currentTab.set('dashboard')" [class.bg-black]="currentTab() === 'dashboard'" [class.text-white]="currentTab() === 'dashboard'" class="px-6 py-2 rounded-xl font-bold transition-all border border-black/5">控制台</button>
            <button (click)="currentTab.set('content')" [class.bg-black]="currentTab() === 'content'" [class.text-white]="currentTab() === 'content'" class="px-6 py-2 rounded-xl font-bold transition-all border border-black/5">内容管理</button>
            <button (click)="currentTab.set('settings')" [class.bg-black]="currentTab() === 'settings'" [class.text-white]="currentTab() === 'settings'" class="px-6 py-2 rounded-xl font-bold transition-all border border-black/5">系统设置</button>
            <button (click)="logout()" class="px-6 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all">退出</button>
          </div>
        </div>

        @if (currentTab() === 'dashboard') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <mat-icon class="text-4xl text-blue-500 mb-2">analytics</mat-icon>
              <span class="text-4xl font-black">{{ stats()?.total || 0 }}</span>
              <span class="text-sm text-gray-400 font-bold tracking-widest uppercase mt-2">总内容</span>
            </div>
            <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <mat-icon class="text-4xl text-orange-500 mb-2">article</mat-icon>
              <span class="text-4xl font-black">{{ stats()?.articles || 0 }}</span>
              <span class="text-sm text-gray-400 font-bold tracking-widest uppercase mt-2">星文</span>
            </div>
            <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <mat-icon class="text-4xl text-purple-500 mb-2">videocam</mat-icon>
              <span class="text-4xl font-black">{{ stats()?.videos || 0 }}</span>
              <span class="text-sm text-gray-400 font-bold tracking-widest uppercase mt-2">星影</span>
            </div>
            <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <mat-icon class="text-4xl text-pink-500 mb-2">image</mat-icon>
              <span class="text-4xl font-black">{{ stats()?.images || 0 }}</span>
              <span class="text-sm text-gray-400 font-bold tracking-widest uppercase mt-2">星像</span>
            </div>
            <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <mat-icon class="text-4xl text-green-500 mb-2">topic</mat-icon>
              <span class="text-4xl font-black">{{ stats()?.topics || 0 }}</span>
              <span class="text-sm text-gray-400 font-bold tracking-widest uppercase mt-2">专题</span>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-black text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
               <div class="relative z-10">
                 <h2 class="text-4xl font-black mb-4">欢迎回来，管理员</h2>
                 <p class="text-gray-400 text-lg mb-8 max-w-md">今天又是充满创造力的一天。查看最新的访问统计或发布全新的视觉作品。</p>
                 <button (click)="currentTab.set('content')" class="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2">
                   <mat-icon>add_circle</mat-icon>立即发布新内容
                 </button>
               </div>
               <mat-icon class="absolute -right-20 -bottom-20 text-[300px] opacity-10 rotate-12">auto_awesome</mat-icon>
            </div>
            <div class="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-center">
               <h3 class="text-2xl font-black mb-6 flex items-center gap-2">
                 <mat-icon class="text-orange-500">info</mat-icon>系统状态
               </h3>
               <div class="flex flex-col gap-6">
                 <div class="flex justify-between items-center pb-4 border-b border-gray-50">
                    <span class="text-gray-500 font-bold tracking-widest">服务器状态</span>
                    <span class="text-green-500 font-black flex items-center gap-2">
                      <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      在线 (RUNNING)
                    </span>
                 </div>
                 <div class="flex justify-between items-center pb-4 border-b border-gray-50">
                    <span class="text-gray-500 font-bold tracking-widest">数据库连接</span>
                    <span class="text-green-500 font-black">正常 (CONNECTED)</span>
                 </div>
                 <div class="flex justify-between items-center">
                    <span class="text-gray-500 font-bold tracking-widest">存储空间</span>
                    <span class="text-black font-black">无限 (UNLIMITED)</span>
                 </div>
               </div>
            </div>
          </div>
        }

        @if (currentTab() === 'content') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Form Section -->
            <div class="lg:col-span-1 glass-panel p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
                <mat-icon>{{ editingItem() ? 'edit' : 'add_circle_outline' }}</mat-icon>
                {{ editingItem() ? '编辑内容' : '发布内容' }}
              </h2>
              
              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
                <div class="flex flex-col gap-1">
                  <label for="type-select" class="text-sm font-bold tracking-widest uppercase text-gray-400">分类</label>
                  <select id="type-select" formControlName="type" class="p-4 rounded-xl border border-gray-100 bg-gray-50 font-bold">
                    <option value="article">星文 (Article)</option>
                    <option value="video">星影 (Video)</option>
                    <option value="image">星像 (Image)</option>
                    <option value="topic">专题 (Topic)</option>
                    <option value="background">背景图 (Background)</option>
                  </select>
                </div>

                <div class="flex flex-col gap-1">
                  <label for="title-input" class="text-sm font-bold tracking-widest uppercase text-gray-400">标题</label>
                  <input id="title-input" type="text" formControlName="title" placeholder="输入标题..." class="p-4 rounded-xl border border-gray-100 bg-gray-50 font-bold focus:ring-2 focus:ring-black outline-none transition-all">
                </div>

                <div class="flex flex-col gap-1">
                  <label for="desc-input" class="text-sm font-bold tracking-widest uppercase text-gray-400">描述</label>
                  <textarea id="desc-input" formControlName="description" rows="3" placeholder="简短描述..." class="p-4 rounded-xl border border-gray-100 bg-gray-50 font-medium focus:ring-2 focus:ring-black outline-none transition-all resize-none"></textarea>
                </div>

                @if (form.value.type === 'article' || form.value.type === 'topic') {
                  <div class="flex flex-col gap-1">
                    <label for="content-input" class="text-sm font-bold tracking-widest uppercase text-gray-400">正文</label>
                    <textarea id="content-input" formControlName="content" rows="6" placeholder="输入正文..." class="p-4 rounded-xl border border-gray-100 bg-gray-50 font-medium focus:ring-2 focus:ring-black outline-none transition-all resize-none"></textarea>
                  </div>
                }
                
                @if (form.value.type !== 'article' && !editingItem()) {
                  <div class="flex flex-col gap-1">
                    <label for="file-upload" class="text-sm font-bold tracking-widest uppercase text-gray-400">上传文件</label>
                    <div class="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-black transition-colors cursor-pointer bg-gray-50">
                       <input id="file-upload" type="file" (change)="onFileSelected($event)" [multiple]="form.value.type === 'image'" [accept]="form.value.type === 'video' ? 'video/*' : 'image/*'" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                       <mat-icon class="text-gray-300 text-4xl mb-2">cloud_upload</mat-icon>
                       <p class="text-sm font-bold text-gray-400">点击或拖拽文件</p>
                       @if (selectedFiles.length > 0) {
                         <p class="text-sm text-black mt-2 font-black">已选择 {{selectedFiles.length}} 个文件</p>
                       }
                    </div>
                  </div>
                }

                <div class="flex gap-3 mt-4">
                  @if (editingItem()) {
                    <button type="button" (click)="cancelEdit()" class="flex-1 bg-gray-100 text-black p-4 rounded-xl font-bold">取消</button>
                  }
                  <button type="submit" [disabled]="form.invalid || uploading()" class="flex-1 bg-black text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                    <mat-icon>{{ uploading() ? 'sync' : 'save' }}</mat-icon>
                    {{ editingItem() ? '保存修改' : '立即发布' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Content List -->
            <div class="lg:col-span-2 glass-panel p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
                <mat-icon>view_list</mat-icon>已发布内容列表
              </h2>

              @if (contentService.loading()) {
                <div class="flex-1 flex justify-center items-center py-20">
                  <mat-icon class="animate-spin text-4xl text-gray-400">sync</mat-icon>
                </div>
              } @else {
                <div class="flex flex-col gap-4 overflow-y-auto pr-2" style="max-height: 800px;">
                  @for (item of contentService.contents(); track item.id) {
                    <div class="content-item flex flex-col sm:flex-row gap-4 p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all" [class.border-black]="editingItem()?.id === item.id">
                      <div class="w-full sm:w-32 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0 relative">
                         @if (item.thumbnailUrl || (item.type === 'image' && item.fileUrl)) {
                           <img [src]="item.thumbnailUrl || item.fileUrl" class="w-full h-full object-cover" alt="Thumb" referrerpolicy="no-referrer">
                         } @else {
                           <div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                             <mat-icon>{{ item.type === 'video' ? 'play_circle' : 'article' }}</mat-icon>
                           </div>
                         }
                      </div>
                      <div class="flex-1 flex flex-col justify-center">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="text-[10px] font-black px-2 py-1 bg-gray-100 rounded uppercase tracking-widest">{{ item.type }}</span>
                          <h3 class="font-bold text-lg line-clamp-1">{{ item.title }}</h3>
                        </div>
                        <p class="text-sm text-gray-500 line-clamp-1">{{ item.description }}</p>
                      </div>
                      <div class="flex items-center gap-2">
                        <button (click)="startEdit(item)" class="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full"><mat-icon>edit</mat-icon></button>
                        <button (click)="deleteItem(item.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"><mat-icon>delete</mat-icon></button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        @if (currentTab() === 'settings') {
          <div class="max-w-3xl mx-auto">
            <div class="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
              <h2 class="text-3xl font-black mb-8">全局系统设置</h2>
              <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()" class="flex flex-col gap-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="flex flex-col gap-2">
                    <label for="site-name" class="text-sm font-bold tracking-widest uppercase text-gray-400">网站名称</label>
                    <input id="site-name" formControlName="siteName" class="p-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold focus:ring-2 focus:ring-black outline-none">
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="author-name" class="text-sm font-bold tracking-widest uppercase text-gray-400">作者姓名</label>
                    <input id="author-name" formControlName="authorName" class="p-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold focus:ring-2 focus:ring-black outline-none">
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="location-input" class="text-sm font-bold tracking-widest uppercase text-gray-400">地理位置</label>
                    <input id="location-input" formControlName="location" class="p-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold focus:ring-2 focus:ring-black outline-none">
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="email-input" class="text-sm font-bold tracking-widest uppercase text-gray-400">联系邮箱</label>
                    <input id="email-input" formControlName="email" class="p-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold focus:ring-2 focus:ring-black outline-none">
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <label for="about-text" class="text-sm font-bold tracking-widest uppercase text-gray-400">关于我描述</label>
                  <textarea id="about-text" formControlName="aboutText" rows="5" class="p-4 rounded-2xl border border-gray-100 bg-gray-50 font-medium focus:ring-2 focus:ring-black outline-none resize-none"></textarea>
                </div>
                <button type="submit" [disabled]="settingsForm.invalid || uploading()" class="bg-black text-white p-5 rounded-2xl font-bold tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                  <mat-icon>save</mat-icon>保存所有设置
                </button>
              </form>
            </div>
            
            <div class="mt-8 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
               <h2 class="text-2xl font-black mb-6">快捷上传头像</h2>
               <div class="flex items-center gap-8">
                  <div class="w-32 h-32 rounded-full overflow-hidden bg-gray-50 border-4 border-white shadow-lg">
                    @if (contentService.settings()?.authorName) {
                       <mat-icon class="text-6xl text-gray-200 w-full h-full flex items-center justify-center">account_circle</mat-icon>
                    }
                  </div>
                  <div class="flex-1">
                    <input type="file" (change)="onAvatarSelected($event)" accept="image/*" class="mb-4">
                    <button (click)="onAvatarSubmit()" [disabled]="!selectedAvatar" class="bg-gray-100 text-black px-6 py-2 rounded-xl font-bold hover:bg-gray-200 disabled:opacity-50">立即更换头像</button>
                  </div>
               </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .glass-panel {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
    }
  `]
})
export class AdminComponent implements OnInit {
  contentService = inject(ContentService);
  fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  isAuthenticated = signal(false);
  password = '';
  currentTab = signal<'dashboard' | 'content' | 'settings'>('dashboard');
  stats = signal<AppStats | null>(null);

  form: FormGroup;
  settingsForm: FormGroup;
  selectedFiles: File[] = [];
  uploading = signal(false);
  errorMessage = signal('');
  editingItem = signal<AppContent | null>(null);

  selectedAvatar: File | null = null;
  avatarUploading = signal(false);

  constructor() {
    this.form = this.fb.group({
      type: ['video', Validators.required],
      title: ['', Validators.required],
      description: [''],
      content: ['']
    });

    this.settingsForm = this.fb.group({
      siteName: ['', Validators.required],
      authorName: ['', Validators.required],
      location: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      aboutText: ['', Validators.required]
    });

    effect(() => {
      if (this.isAuthenticated() && isPlatformBrowser(this.platformId)) {
        this.loadDashboardData();
      }
    });
  }

  async ngOnInit() {
    await this.contentService.loadSettings();
    if (this.contentService.settings()) {
      this.settingsForm.patchValue(this.contentService.settings()!);
    }
  }

  async loadDashboardData() {
    this.stats.set(await this.contentService.getStats());
    await this.contentService.loadContents();
  }

  login(event: Event) {
    event.preventDefault();
    if (this.password === 'admin123') { 
      this.isAuthenticated.set(true);
      this.password = '';
    } else {
      if (isPlatformBrowser(this.platformId)) {
        alert('密码错误。');
      }
    }
  }

  logout() {
    this.isAuthenticated.set(false);
    this.currentTab.set('dashboard');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedAvatar = input.files[0];
    }
  }

  startEdit(item: AppContent) {
    this.editingItem.set(item);
    this.currentTab.set('content');
    this.form.patchValue({
      type: item.type,
      title: item.title,
      description: item.description || '',
      content: item.content || ''
    });
    this.form.get('type')?.disable();
  }

  cancelEdit() {
    this.editingItem.set(null);
    this.form.get('type')?.enable();
    this.form.reset({ type: 'video' });
    this.selectedFiles = [];
    this.errorMessage.set('');
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.uploading.set(true);
    try {
      if (this.editingItem()) {
        await this.contentService.updateContent(this.editingItem()!.id, this.form.getRawValue());
      } else {
        const formData = new FormData();
        Object.keys(this.form.value).forEach(key => formData.append(key, this.form.value[key]));
        this.selectedFiles.forEach(file => formData.append('files', file));
        await this.contentService.uploadContent(formData);
      }
      await this.loadDashboardData();
      this.cancelEdit();
    } catch (_e) {
      this.errorMessage.set('提交失败');
    } finally {
      this.uploading.set(false);
    }
  }

  async deleteItem(id: string) {
    if (confirm('确定删除吗？')) {
      await this.contentService.deleteContent(id);
      await this.loadDashboardData();
    }
  }

  async saveSettings() {
    if (this.settingsForm.invalid) return;
    this.uploading.set(true);
    try {
      await this.contentService.updateSettings(this.settingsForm.value);
      alert('设置已保存');
    } finally {
      this.uploading.set(false);
    }
  }

  async onAvatarSubmit() {
    if (!this.selectedAvatar) return;
    const formData = new FormData();
    formData.append('type', 'avatar');
    formData.append('title', 'Avatar');
    formData.append('files', this.selectedAvatar);
    await this.contentService.uploadContent(formData);
    this.selectedAvatar = null;
    alert('头像已更新');
  }
}
