import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';

export interface AppContent {
  id: string;
  type: 'article' | 'video' | 'image' | 'background' | 'topic' | 'avatar';
  title: string;
  description: string;
  content?: string; // For articles
  fileUrl?: string; // For videos and images
  thumbnailUrl?: string; // For auto-generated covers
  createdAt: number;
}

export interface AppStats {
  total: number;
  articles: number;
  videos: number;
  images: number;
  topics: number;
}

export interface SiteSettings {
  siteName: string;
  authorName: string;
  location: string;
  email: string;
  aboutText: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private platformId = inject(PLATFORM_ID);
  contents = signal<AppContent[]>([]);
  settings = signal<SiteSettings | null>(null);
  loading = signal<boolean>(false);
  searchTerm = signal<string>('');
  
  private adminToken = 'admin_secret_token_123'; // Hardcoded for demo, should be managed securely

  filteredContents = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.contents().filter(c => 
      c.title.toLowerCase().includes(term) || 
      c.description.toLowerCase().includes(term)
    );
  });

  private getBaseUrl(): string {
    if (typeof window === 'undefined') {
      // In SSR/Prerendering, we must use absolute URLs
      // 1. Check for APP_URL environment variable (set in cloud platforms)
      // 2. Default to localhost:3000 for AI Studio development
      const envUrl = (globalThis as unknown as { APP_URL?: string }).APP_URL || 'http://localhost:3000';
      return envUrl;
    }
    return '';
  }

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.adminToken}`
    };
  }

  async getStats(): Promise<AppStats> {
    const baseUrl = this.getBaseUrl();
    const res = await fetch(`${baseUrl}/api/stats`);
    return await res.json();
  }

  async loadSettings() {
    try {
      const baseUrl = this.getBaseUrl();
      const res = await fetch(`${baseUrl}/api/settings`);
      if (res.ok) {
        this.settings.set(await res.json());
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  }

  async updateSettings(data: SiteSettings) {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        this.settings.set(await res.json());
      }
    } catch (e) {
      console.error('Update settings failed', e);
      throw e;
    }
  }

  async loadContents(type?: string) {
    this.loading.set(true);
    try {
      const baseUrl = this.getBaseUrl();
      const url = type ? `${baseUrl}/api/contents?type=${type}` : `${baseUrl}/api/contents`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        this.contents.set(data);
      }
    } catch (e) {
      console.error('Failed to load contents', e);
    } finally {
      this.loading.set(false);
    }
  }

  async uploadContent(formData: FormData) {
    try {
      const res = await fetch('/api/contents', {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders()
        },
        body: formData
      });
      if (res.ok) {
        const newData = await res.json();
        // Reload all to ensure consistency
        await this.loadContents();
        return newData;
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
    } catch (e) {
      console.error('Upload error', e);
      throw e;
    }
  }

  async updateContent(id: string, data: Partial<AppContent>) {
    try {
      const res = await fetch(`/api/contents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await this.loadContents();
      } else {
        throw new Error('Update failed');
      }
    } catch (e) {
      console.error('Update error', e);
      throw e;
    }
  }

  async deleteContent(id: string) {
    try {
      const res = await fetch(`/api/contents/${id}`, {
        method: 'DELETE',
        headers: {
          ...this.getAuthHeaders()
        }
      });
      if (res.ok) {
        this.contents.update(curr => curr.filter(c => c.id !== id));
      }
    } catch (e) {
      console.error('Delete error', e);
    }
  }
}
