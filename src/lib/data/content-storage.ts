import { ContentItem } from '@/lib/types/enhanced';
import { storage } from './storage';

export class ContentStorage {
  private static readonly CONTENT_KEY = 'instructor_content';
  private static readonly UPLOADS_KEY = 'instructor_uploads';

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
    const content = localStorage.getItem(this.CONTENT_KEY);
    return content ? JSON.parse(content) : [];
  }

  static saveContent(item: Omit<ContentItem, 'id' | 'uploadedAt'>): ContentItem {
    const content = this.getAllContent();
    const newItem: ContentItem = {
      ...item,
      id: Date.now().toString(),
      uploadedAt: new Date()
    };
    content.push(newItem);
    localStorage.setItem(this.CONTENT_KEY, JSON.stringify(content));
    return newItem;
  }

  static updateContent(id: string, updates: Partial<ContentItem>): ContentItem | null {
    const content = this.getAllContent();
    const index = content.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    content[index] = { ...content[index], ...updates };
    localStorage.setItem(this.CONTENT_KEY, JSON.stringify(content));
    return content[index];
  }

  static deleteContent(id: string): boolean {
    const content = this.getAllContent();
    const filtered = content.filter(item => item.id !== id);
    if (filtered.length === content.length) return false;
    
    localStorage.setItem(this.CONTENT_KEY, JSON.stringify(filtered));
    return true;
  }

  static uploadFile(file: File, courseId: string, instructorId: string, assignedStudents?: string[]): Promise<ContentItem> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const contentType = this.getContentType(file.type);
        
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
        localStorage.setItem(this.UPLOADS_KEY, JSON.stringify(uploads));
        
        resolve(savedItem);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  static getUploads(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const uploads = localStorage.getItem(this.UPLOADS_KEY);
    return uploads ? JSON.parse(uploads) : {};
  }

  static getFileData(contentId: string): string | null {
    const uploads = this.getUploads();
    return uploads[contentId] || null;
  }

  private static getContentType(mimeType: string): ContentItem['type'] {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('text')) return 'document';
    return 'notes';
  }
}
