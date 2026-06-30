import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContentService, AppContent } from './services/content.service';
import { MatIconModule } from '@angular/material/icon';
import { animate, stagger } from 'motion';

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
          <p class="text-xs text-gray-400 mt-4">前端仅供浏览，所有发布、修改、删除操作需管理员权限。</p>
        </div>
      } @else {
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-3xl font-bold flex items-center gap-2">
            <mat-icon>admin_panel_settings</mat-icon>后端内容管理
          </h1>
          <button (click)="logout()" class="text-sm px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium">退出登录</button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Form Section (Upload / Edit) -->
          <div class="lg:col-span-1 glass-panel p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
              <mat-icon>{{ editingItem() ? 'edit' : 'add_circle_outline' }}</mat-icon>
              {{ editingItem() ? '编辑内容' : '发布内容' }}
            </h2>
            
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
              <div class="flex flex-col gap-1">
                <label class="text-sm font-medium">分类 (Category)</label>
                <select formControlName="type" class="p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition-all">
                  <option value="article">星文 (Article)</option>
                  <option value="video">星影 (Video)</option>
                  <option value="image">星像 (Image)</option>
                  <option value="background">背景图 (Background)</option>
                </select>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-sm font-medium">标题 (Title)</label>
                <input type="text" formControlName="title" placeholder="输入标题..." class="p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition-all">
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-sm font-medium">描述 (Description)</label>
                <textarea formControlName="description" rows="3" placeholder="简短描述..." class="p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"></textarea>
              </div>

              @if (form.value.type === 'article') {
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium">文章内容 (Content)</label>
                  <textarea formControlName="content" rows="6" placeholder="输入文章正文..." class="p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"></textarea>
                </div>
              } @else if (!editingItem()) {
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium">上传文件 (Upload File)</label>
                  <div class="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-black transition-colors cursor-pointer bg-gray-50">
                     <input type="file" (change)="onFileSelected($event)" [multiple]="form.value.type === 'image'" [accept]="form.value.type === 'video' ? 'video/*' : 'image/*'" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                     <mat-icon class="text-gray-400 mb-2">cloud_upload</mat-icon>
                     <p class="text-sm font-medium text-gray-600">点击或拖拽文件到此处</p>
                     @if (selectedFiles.length > 0) {
                       <p class="text-xs text-black mt-2 font-semibold">已选择 {{selectedFiles.length}} 个文件</p>
                     } @else {
                       <p class="text-xs text-gray-400 mt-2">支持无限制大小上传</p>
                     }
                  </div>
                </div>
              } @else {
                <div class="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                  <mat-icon class="text-gray-400">info</mat-icon>
                  <p class="text-sm text-gray-600">正在编辑基本信息，如需更换文件请删除后重新上传。</p>
                </div>
              }

              <div class="flex gap-3 mt-2">
                @if (editingItem()) {
                  <button type="button" (click)="cancelEdit()" class="flex-1 bg-gray-200 text-black p-4 rounded-xl font-medium hover:bg-gray-300 transition-all">取消</button>
                }
                <button type="submit" [disabled]="form.invalid || uploading()" class="flex-1 bg-black text-white p-4 rounded-xl font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (uploading()) {
                    <mat-icon class="animate-spin">sync</mat-icon> 保存中...
                  } @else {
                    <mat-icon>save</mat-icon> {{ editingItem() ? '保存修改' : '保存发布' }}
                  }
                </button>
              </div>
              
              @if (errorMessage()) {
                <p class="text-red-500 text-sm mt-2">{{ errorMessage() }}</p>
              }
            </form>
          </div>

          <!-- Content List -->
          <div class="lg:col-span-2 glass-panel p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
              <mat-icon>view_list</mat-icon>分类管理与已发布内容
            </h2>

            @if (contentService.loading()) {
              <div class="flex-1 flex justify-center items-center py-20">
                <mat-icon class="animate-spin text-4xl text-gray-400">sync</mat-icon>
              </div>
            } @else if (contentService.contents().length === 0) {
              <div class="flex-1 flex flex-col justify-center items-center py-20 text-gray-400">
                <mat-icon class="text-6xl mb-4 opacity-50">inbox</mat-icon>
                <p>暂无内容，请先发布</p>
              </div>
            } @else {
              <div class="flex flex-col gap-4 overflow-y-auto pr-2" style="max-height: 800px;">
                @for (item of contentService.contents(); track item.id) {
                  <div class="content-item flex flex-col sm:flex-row gap-4 p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all" [class.border-black]="editingItem()?.id === item.id" [class.border-gray-100]="editingItem()?.id !== item.id">
                    
                    @if (item.type === 'image' || item.type === 'background') {
                      <div class="w-full sm:w-32 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                         <img [src]="item.fileUrl" [alt]="item.title" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                      </div>
                    } @else if (item.type === 'video') {
                      <div class="w-full sm:w-32 h-24 bg-black rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                         <mat-icon class="text-white text-3xl opacity-80">play_circle</mat-icon>
                      </div>
                    } @else {
                      <div class="w-full sm:w-32 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-gray-100">
                         <mat-icon class="text-gray-400 text-3xl">article</mat-icon>
                      </div>
                    }

                    <div class="flex-1 flex flex-col justify-center">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-bold px-2 py-1 bg-gray-100 rounded-md uppercase tracking-wider">
                          {{ item.type === 'article' ? '星文' : (item.type === 'video' ? '星影' : (item.type === 'image' ? '星像' : '背景')) }}
                        </span>
                        <h3 class="font-bold text-lg leading-tight line-clamp-1">{{ item.title }}</h3>
                      </div>
                      <p class="text-sm text-gray-600 line-clamp-2 mb-2">{{ item.description }}</p>
                      <p class="text-xs text-gray-400">{{ item.createdAt | date:'medium' }}</p>
                    </div>

                    <div class="flex items-center gap-2 justify-end sm:justify-center">
                      <button (click)="startEdit(item)" class="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors" title="编辑">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button (click)="deleteItem(item.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="删除">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>

                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class AdminComponent implements OnInit {
  contentService = inject(ContentService);
  fb = inject(FormBuilder);

  isAuthenticated = signal(false);
  password = '';

  form: FormGroup;
  selectedFiles: File[] = [];
  uploading = signal(false);
  errorMessage = signal('');
  editingItem = signal<AppContent | null>(null);

  constructor() {
    this.form = this.fb.group({
      type: ['video', Validators.required],
      title: ['', Validators.required],
      description: [''],
      content: ['']
    });

    effect(() => {
      if (this.isAuthenticated()) {
        const contents = this.contentService.contents();
        if (contents.length > 0) {
          setTimeout(() => {
            const items = document.querySelectorAll('.content-item');
            if (items.length) {
              animate(
                items,
                { opacity: [0, 1], y: [20, 0] },
                { delay: stagger(0.05), duration: 0.5, ease: 'easeOut' }
              );
            }
          }, 50);
        }
      }
    });
  }

  ngOnInit() {
    // We only load contents if authenticated, but doing it early is fine too.
    this.contentService.loadContents();
    
    // Reset file selection and clear fields when type changes if not editing
    this.form.get('type')?.valueChanges.subscribe(() => {
      if (!this.editingItem()) {
        this.selectedFiles = [];
      }
    });
  }

  login(event: Event) {
    event.preventDefault();
    if (this.password === 'admin123') { // Simple hardcoded demo password
      this.isAuthenticated.set(true);
      this.password = '';
    } else {
      alert('密码错误。仅供管理员访问。可以尝试输入: admin123');
    }
  }

  logout() {
    this.isAuthenticated.set(false);
    this.cancelEdit();
  }

  onFileSelected(event: any) {
    if (event.target.files) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  startEdit(item: AppContent) {
    this.editingItem.set(item);
    this.form.patchValue({
      type: item.type,
      title: item.title,
      description: item.description || '',
      content: item.content || ''
    });
    // Disable type changing when editing
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

    // form.value doesn't include disabled fields, so we get raw value
    const { type, title, description, content } = this.form.getRawValue();
    const editMode = this.editingItem();
    
    if (!editMode && type !== 'article' && this.selectedFiles.length === 0) {
      this.errorMessage.set('请上传文件 (Please upload files)');
      return;
    }

    this.uploading.set(true);
    this.errorMessage.set('');

    try {
      if (editMode) {
        // Edit API Call
        await this.contentService.updateContent(editMode.id, {
          title,
          description,
          content
        });
        this.cancelEdit();
      } else {
        // Upload API Call
        const formData = new FormData();
        formData.append('type', type);
        formData.append('title', title);
        formData.append('description', description);
        
        if (type === 'article') {
          formData.append('content', content);
        } else {
          for (const file of this.selectedFiles) {
            formData.append('files', file);
          }
        }

        await this.contentService.uploadContent(formData);
        this.cancelEdit(); // resets form
      }
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Operation failed');
    } finally {
      this.uploading.set(false);
    }
  }

  async deleteItem(id: string) {
    if (confirm('确定要删除此内容吗？')) {
      await this.contentService.deleteContent(id);
      if (this.editingItem()?.id === id) {
        this.cancelEdit();
      }
    }
  }
}
