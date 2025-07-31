'use client';

import { useState, useEffect } from 'react';
import { QuizQuestion, QuestionType, MediaAttachment } from '@/lib/types/quiz-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Upload, Image, Video, FileText, Star } from 'lucide-react';

interface EnhancedQuestionEditorProps {
  question: QuizQuestion;
  onSave: (question: QuizQuestion) => void;
  onCancel: () => void;
}

export default function EnhancedQuestionEditor({ question, onSave, onCancel }: EnhancedQuestionEditorProps) {
  const [editedQuestion, setEditedQuestion] = useState<QuizQuestion>(question);
  const [activeTab, setActiveTab] = useState('basic');
  const [mediaFiles, setMediaFiles] = useState<MediaAttachment[]>(question.media || []);

  useEffect(() => {
    setEditedQuestion(question);
    setMediaFiles(question.media || []);
  }, [question]);

  const handleSave = () => {
    onSave({
      ...editedQuestion,
      media: mediaFiles
    });
  };

  const renderQuestionTypeSpecific = () => {
    switch (editedQuestion.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <Label>Options</Label>
            {editedQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(editedQuestion.options || [])];
                    newOptions[index] = e.target.value;
                    setEditedQuestion({ ...editedQuestion, options: newOptions });
                  }}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newOptions = editedQuestion.options?.filter((_, i) => i !== index) || [];
                    setEditedQuestion({ ...editedQuestion, options: newOptions });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newOptions = [...(editedQuestion.options || []), ''];
                setEditedQuestion({ ...editedQuestion, options: newOptions });
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Option
            </Button>
            <div>
              <Label>Correct Answer</Label>
              <Select
                value={editedQuestion.correctAnswer as string}
                onValueChange={(value) => setEditedQuestion({ ...editedQuestion, correctAnswer: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {editedQuestion.options?.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option || `Option ${index + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'true-false':
        return (
          <div>
            <Label>Correct Answer</Label>
            <Select
              value={editedQuestion.correctAnswer as string}
              onValueChange={(value) => setEditedQuestion({ ...editedQuestion, correctAnswer: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'matching':
        return (
          <div className="space-y-4">
            <Label>Matching Pairs</Label>
            {editedQuestion.options?.map((option, index) => (
              <div key={index} className="grid grid-cols-2 gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(editedQuestion.options || [])];
                    newOptions[index] = e.target.value;
                    setEditedQuestion({ ...editedQuestion, options: newOptions });
                  }}
                  placeholder={`Item ${index + 1}`}
                />
                <Input
                  value={(editedQuestion.correctAnswer as string[])[index] || ''}
                  onChange={(e) => {
                    const newAnswers = [...(editedQuestion.correctAnswer as string[])];
                    newAnswers[index] = e.target.value;
                    setEditedQuestion({ ...editedQuestion, correctAnswer: newAnswers });
                  }}
                  placeholder={`Match ${index + 1}`}
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newOptions = [...(editedQuestion.options || []), ''];
                const newAnswers = [...(editedQuestion.correctAnswer as string[] || []), ''];
                setEditedQuestion({ ...editedQuestion, options: newOptions, correctAnswer: newAnswers });
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Pair
            </Button>
          </div>
        );

      case 'ranking':
        return (
          <div className="space-y-4">
            <Label>Ranking Items</Label>
            {editedQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium">{index + 1}.</span>
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(editedQuestion.options || [])];
                    newOptions[index] = e.target.value;
                    setEditedQuestion({ ...editedQuestion, options: newOptions });
                  }}
                  placeholder={`Item ${index + 1}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newOptions = editedQuestion.options?.filter((_, i) => i !== index) || [];
                    setEditedQuestion({ ...editedQuestion, options: newOptions });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newOptions = [...(editedQuestion.options || []), ''];
                setEditedQuestion({ ...editedQuestion, options: newOptions });
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>
        );

      case 'code-editor':
        return (
          <div className="space-y-4">
            <div>
              <Label>Programming Language</Label>
              <Select
                value={editedQuestion.codeEditor?.language || 'javascript'}
                onValueChange={(value) => setEditedQuestion({
                  ...editedQuestion,
                  codeEditor: {
                    ...editedQuestion.codeEditor,
                    language: value,
                    starterCode: editedQuestion.codeEditor?.starterCode || '',
                    testCases: editedQuestion.codeEditor?.testCases || []
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="html">HTML/CSS</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Starter Code</Label>
              <Textarea
                value={editedQuestion.codeEditor?.starterCode || ''}
                onChange={(e) => setEditedQuestion({
                  ...editedQuestion,
                  codeEditor: {
                    ...editedQuestion.codeEditor,
                    starterCode: e.target.value
                  }
                })}
                rows={4}
                placeholder="Enter starter code..."
              />
            </div>
          </div>
        );

      case 'file-upload':
        return (
          <div className="space-y-4">
            <div>
              <Label>Allowed File Types</Label>
              <Input
                value={editedQuestion.fileUpload?.allowedTypes.join(', ') || ''}
                onChange={(e) => setEditedQuestion({
                  ...editedQuestion,
                  fileUpload: {
                    ...editedQuestion.fileUpload,
                    allowedTypes: e.target.value.split(',').map(t => t.trim())
                  }
                })}
                placeholder="pdf, doc, docx, jpg, png"
              />
            </div>
            <div>
              <Label>Max File Size (MB)</Label>
              <Input
                type="number"
                value={editedQuestion.fileUpload?.maxSize || 10}
                onChange={(e) => setEditedQuestion({
                  ...editedQuestion,
                  fileUpload: {
                    ...editedQuestion.fileUpload,
                    maxSize: parseInt(e.target.value)
                  }
                })}
              />
            </div>
            <div>
              <Label>Max Files</Label>
              <Input
                type="number"
                value={editedQuestion.fileUpload?.maxFiles || 1}
                onChange={(e) => setEditedQuestion({
                  ...editedQuestion,
                  fileUpload: {
                    ...editedQuestion.fileUpload,
                    maxFiles: parseInt(e.target.value)
                  }
                })}
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Label>Correct Answer</Label>
            <Textarea
              value={editedQuestion.correctAnswer as string}
              onChange={(e) => setEditedQuestion({ ...editedQuestion, correctAnswer: e.target.value })}
              placeholder="Enter correct answer..."
            />
          </div>
        );
    }
  };

  const handleMediaUpload = (type: MediaAttachment['type']) => {
    // In a real app, this would handle file upload
    const newMedia: MediaAttachment = {
      type,
      url: `https://example.com/media/${type}_${Date.now()}`,
      alt: `Uploaded ${type}`,
      caption: `Sample ${type} for question`
    };
    setMediaFiles([...mediaFiles, newMedia]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Question</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label>Question Type</Label>
              <Badge variant="outline" className="ml-2">{editedQuestion.type}</Badge>
            </div>
            <div>
              <Label>Question Text</Label>
              <Textarea
                value={editedQuestion.question}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                rows={3}
                placeholder="Enter your question..."
              />
            </div>
            <div>
              <Label>Points</Label>
              <Input
                type="number"
                value={editedQuestion.points}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, points: parseInt(e.target.value) || 0 })}
                min="1"
              />
            </div>
          </TabsContent>

          <TabsContent value="content">
            {renderQuestionTypeSpecific()}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div>
              <Label>Difficulty</Label>
              <Select
                value={editedQuestion.difficulty || 'medium'}
                onValueChange={(value) => setEditedQuestion({ ...editedQuestion, difficulty: value as 'easy' | 'medium' | 'hard' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={editedQuestion.category || ''}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, category: e.target.value })}
                placeholder="Enter category..."
              />
            </div>
            <div>
              <Label>Tags</Label>
              <Input
                value={editedQuestion.tags?.join(', ') || ''}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, tags: e.target.value.split(',').map(t => t.trim()) })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editedQuestion.required}
                onCheckedChange={(checked) => setEditedQuestion({ ...editedQuestion, required: checked })}
              />
              <Label>Required Question</Label>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleMediaUpload('image')}
                className="flex items-center gap-2"
              >
                <Image className="h-4 w-4" /> Add Image
              </Button>
              <Button
                variant="outline"
                onClick={() => handleMediaUpload('video')}
                className="flex items-center gap-2"
              >
                <Video className="h-4 w-4" /> Add Video
              </Button>
              <Button
                variant="outline"
                onClick={() => handleMediaUpload('audio')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" /> Add Audio
              </Button>
              <Button
                variant="outline"
                onClick={() => handleMediaUpload('document')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" /> Add Document
              </Button>
            </div>
            {mediaFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Attached Media</Label>
                {mediaFiles.map((media, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{media.type}: {media.alt}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMediaFiles(mediaFiles.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Question
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
