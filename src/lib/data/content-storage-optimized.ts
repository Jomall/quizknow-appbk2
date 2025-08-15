import { ContentItem } from '@/lib/types/enhanced';
import { storage } from './storage';

export class ContentStorage {
  private static readonly CONTENT_KEY = 'instructor_content';
  private static readonly UPLOADS_KEY = 'instructor_uploads';
  private static readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit
  private static readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB total limit

  static getContentByCourse(courseId: string): ContentItem[] {
    const content = this.getAllContent();
    return content.filter(item => item.courseId === courseId);
  }

  static getContentByInstructor(instructorId: string): ContentItem[] {
    const content = this.getAllContent();
    return content.filter(item => item.instructorId === instructorId && item.isPublic);
  }

  static getContentForStudent(studentId: string): ContentItem[] {
    const content = this.getAllContent();
    return content.filter(item => 
      item.isPublic && 
      (!item.assignedStudents || item.assignedStudents.length === 0 || item.assignedStudents.includes(studentId))
    );
  }

  static getAllContent(): ContentItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const content = localStorage.getItem(this.CONTENT_KEY);
      return content ? JSON.parse(content) : [];
    } catch (error) {
      console.error('Error loading content:', error);
      return [];
    }
  }

  static saveContent(item: Omit<ContentItem, 'id' | 'uploadedAt'>): ContentItem {
    const content = this.getAllContent();
    const newItem: ContentItem = {
      ...item,
      id: Date.now().toString(),
      uploadedAt: new Date()
    };
    
    // Check storage size before adding
    const estimatedSize = JSON.stringify([...content, newItem]).length;
    if (estimatedSize > this.MAX_STORAGE_SIZE) {
      console.warn('Storage limit exceeded, cleaning up old content');
      this.cleanupStorage();
    }
    
    content.push(newItem);
    
    try {
      localStorage.setItem(this.CONTENT_KEY, JSON.stringify(content));
    } catch (error) {
      console.error('Storage quota exceeded, using external storage approach');
      // Store only metadata, file content will be handled separately
      const metadataOnly = {
        ...newItem,
        fileUrl: `external:${newItem.title}`,
        fileSize: 0
      };
      content[content.length - 1] = metadataOnly;
      localStorage.setItem(this.CONTENT_KEY, JSON.stringify(content));
    }
    
    return newItem;
  }

  static updateContent(id: string, updates: Partial<ContentItem>): ContentItem | null {
    const content = this.getAllContent();
    const index = content.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    content[index] = { ...content[index], ...updates };
    
    try {
      localStorage.setItem(this.CONTENT_KEY, JSON.stringify(content));
    } catch (error) {
      console.error('Error updating content:', error);
      return null;
    }
    
    return content[index];
  }

  static deleteContent(id: string): boolean {
    const content = this.getAllContent();
    const filtered = content.filter(item => item.id !== id);
    if (filtered.length === content.length) return false;
    
    // Also remove from uploads
    const uploads = this.getUploads();
    delete uploads[id];
    this.saveUploads(uploads);
    
    try {
      localStorage.setItem(this.CONTENT_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  }

  static uploadFile(file: File, courseId: string, instructorId: string, assignedStudents?: string[]): Promise<ContentItem> {
    return new Promise((resolve, reject) => {
      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        reject(new Error(`File size exceeds ${this.MAX_FILE_SIZE / (1024 * 1024)}MB limit`));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const contentType = this.getContentType(file.type);
        
        // Check if base64 string is too large
        if (base64.length > this.MAX_FILE_SIZE * 1.5) { // Account for base64 overhead
          // Use external storage approach
          const item: Omit<ContentItem, 'id' | 'uploadedAt'> = {
            courseId,
            type: contentType,
            title: file.name,
            fileUrl: `external:${file.name}`,
            fileSize: file.size,
            fileType: file.type,
            instructorId,
            isPublic: true,
            order: 0,
            assignedStudents
          };
          
          const savedItem = this.saveContent(item);
          resolve(savedItem);
          return;
        }
        
        const item: Omit<ContentItem, 'id' | 'uploadedAt'> = {
          courseId,
          type: contentType,
          title: file.name,
          fileUrl: base64,
          fileSize: file.size,
          fileType: file.type,
          instructorId,
          isPublic: true,
          order: 0,
          assignedStudents
        };
        
        const savedItem = this.saveContent(item);
        
        // Store file data separately for large files
        const uploads = this.getUploads();
        uploads[savedItem.id] = base64;
        this.saveUploads(uploads);
        
        resolve(savedItem);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  static getUploads(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    try {
      const uploads = localStorage.getItem(this.UPLOADS_KEY);
      return uploads ? JSON.parse(uploads) : {};
    } catch (error) {
      console.error('Error loading uploads:', error);
      return {};
    }
  }

  private static saveUploads(uploads: Record<string, string>) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.UPLOADS_KEY, JSON.stringify(uploads));
    } catch (error) {
      console.error('Error saving uploads:', error);
    }
  }

  static getFileData(contentId: string): string | null {
    const uploads = this.getUploads();
    return uploads[contentId] || null;
  }

  static cleanupStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Remove orphaned uploads
      const content = this.getAllContent();
      const uploads = this.getUploads();
      const contentIds = content.map(item => item.id);
      
      Object.keys(uploads).forEach(uploadId => {
        if (!contentIds.includes(uploadId)) {
          delete uploads[uploadId];
        }
      });
      
      this.saveUploads(uploads);
      
      // Check total storage usage
      const totalUsage = Object.keys(localStorage).reduce((total, key) => {
        return total + (localStorage.getItem(key)?.length || 0);
      }, 0);
      
      if (totalUsage > 8 * 1024 * 1024) { // 8MB warning
        console.warn('Storage usage high:', totalUsage / (1024 * 1024), 'MB');
      }
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  static getStorageUsage(): number {
    if (typeof window === 'undefined') return 0;
    return Object.keys(localStorage).reduce((total, key) => {
      return total + (localStorage.getItem(key)?.length || 0);
    }, 0);
  }

  private static getContentType(mimeType: string): ContentItem['type'] {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('text')) return 'document';
    return 'notes';
  }
}
