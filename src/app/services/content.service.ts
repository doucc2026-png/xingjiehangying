import { Injectable, signal, computed } from '@angular/core';

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

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  contents = signal<AppContent[]>([]);
  loading = signal<boolean>(false);
  searchTerm = signal<string>('');

  filteredContents = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.contents().filter(c => 
      c.title.toLowerCase().includes(term) || 
      c.description.toLowerCase().includes(term)
    );
  });

  async loadContents(type?: string) {
    this.loading.set(true);
    try {
      const url = type ? `/api/contents?type=${type}` : '/api/contents';
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
          'Content-Type': 'application/json'
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
        method: 'DELETE'
      });
      if (res.ok) {
        this.contents.update(curr => curr.filter(c => c.id !== id));
      }
    } catch (e) {
      console.error('Delete error', e);
    }
  }
}
