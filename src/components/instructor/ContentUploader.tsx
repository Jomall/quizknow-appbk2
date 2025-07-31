'use client';

import { useState } from 'react';
import { ContentStorage } from '@/lib/data/content-storage';
import { ContentItem } from '@/lib/types/enhanced';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentSelector from '@/components/instructor/StudentSelector';
import { Upload, FileVideo, FileAudio, FileText, FileImage } from 'lucide-react';
import { toast } from 'sonner';

interface ContentUploaderProps {
  courseId: string;
  instructorId: string;
  onUploadComplete: () => void;
}

export default function ContentUploader({ courseId, instructorId, onUploadComplete }: ContentUploaderProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<'video' | 'audio' | 'document' | 'image' | 'notes'>('video');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (!title.trim()) {
      toast.error('Please enter a title for your content');
      return;
    }
    
    setIsUploading(true);
    
    try {
      await ContentStorage.uploadFile(file, courseId, instructorId, selectedStudents);
      toast.success('Content uploaded successfully!');
      setTitle('');
      setDescription('');
      setFile(null);
      setSelectedStudents([]);
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload content. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getContentIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'video': return <FileVideo className="h-5 w-5" />;
      case 'audio': return <FileAudio className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'image': return <FileImage className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your content"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="contentType">Content Type</Label>
            <Select value={contentType} onValueChange={(value) => setContentType(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <FileVideo className="h-4 w-4" />
                    Video
                  </div>
                </SelectItem>
                <SelectItem value="audio">
                  <div className="flex items-center gap-2">
                    <FileAudio className="h-4 w-4" />
                    Audio
                  </div>
                </SelectItem>
                <SelectItem value="document">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Document
                  </div>
                </SelectItem>
                <SelectItem value="image">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    Image
                  </div>
                </SelectItem>
                <SelectItem value="notes">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <StudentSelector 
            courseId={courseId}
            selectedStudents={selectedStudents}
            onStudentSelectionChange={setSelectedStudents}
          />
          
          <div>
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept={
                contentType === 'video' ? 'video/*' :
                contentType === 'audio' ? 'audio/*' :
                contentType === 'image' ? 'image/*' :
                contentType === 'document' ? '.pdf,.doc,.docx,.txt,.ppt,.pptx' :
                '*'
              }
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {contentType === 'video' && 'Supports MP4, MOV, AVI, and other video formats'}
              {contentType === 'audio' && 'Supports MP3, WAV, AAC, and other audio formats'}
              {contentType === 'image' && 'Supports JPG, PNG, GIF, and other image formats'}
              {contentType === 'document' && 'Supports PDF, DOC, DOCX, TXT, and other document formats'}
              {contentType === 'notes' && 'Supports TXT, PDF, and other text formats'}
            </p>
          </div>
          
          <Button type="submit" disabled={isUploading} className="w-full">
            {isUploading ? 'Uploading...' : 'Upload Content'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
