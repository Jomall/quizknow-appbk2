'use client';

import { useState } from 'react';
import { QuizSettings } from '@/lib/types/quiz-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock, Shield, Accessibility } from 'lucide-react';
import { format } from 'date-fns';

interface EnhancedQuizSettingsProps {
  settings: QuizSettings;
  onSettingsChange: (settings: QuizSettings) => void;
}

export default function EnhancedQuizSettings({ settings, onSettingsChange }: EnhancedQuizSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');

  const updateSetting = <K extends keyof QuizSettings>(key: K, value: QuizSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Time Limit (minutes)</Label>
          <Input
            type="number"
            value={settings.timeLimit}
            onChange={(e) => updateSetting('timeLimit', parseInt(e.target.value) || 30)}
            min="1"
            max="480"
          />
        </div>
        <div>
          <Label>Passing Score (%)</Label>
          <Input
            type="number"
            value={settings.passingScore}
            onChange={(e) => updateSetting('passingScore', parseInt(e.target.value) || 70)}
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Max Attempts</Label>
          <Input
            type="number"
            value={settings.maxAttempts || 1}
            onChange={(e) => updateSetting('maxAttempts', parseInt(e.target.value) || 1)}
            min="1"
            max="10"
            disabled={!settings.allowMultipleAttempts}
          />
        </div>
        <div>
          <Label>Question Pool Size</Label>
          <Input
            type="number"
            value={settings.questionPool?.questionCount || 0}
            onChange={(e) => updateSetting('questionPool', {
              ...settings.questionPool,
              questionCount: parseInt(e.target.value) || 0
            })}
            min="0"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Shuffle Questions</Label>
          <Switch
            checked={settings.shuffleQuestions}
            onCheckedChange={(checked) => updateSetting('shuffleQuestions', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Shuffle Options</Label>
          <Switch
            checked={settings.shuffleOptions}
            onCheckedChange={(checked) => updateSetting('shuffleOptions', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Allow Multiple Attempts</Label>
          <Switch
            checked={settings.allowMultipleAttempts}
            onCheckedChange={(checked) => updateSetting('allowMultipleAttempts', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Show Correct Answers</Label>
          <Switch
            checked={settings.showCorrectAnswers}
            onCheckedChange={(checked) => updateSetting('showCorrectAnswers', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Show Results</Label>
          <Switch
            checked={settings.showResults}
            onCheckedChange={(checked) => updateSetting('showResults', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Show Feedback</Label>
          <Switch
            checked={settings.showFeedback}
            onCheckedChange={(checked) => updateSetting('showFeedback', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Allow Review After Submission</Label>
          <Switch
            checked={settings.allowReview}
            onCheckedChange={(checked) => updateSetting('allowReview', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Require Passing Grade</Label>
          <Switch
            checked={settings.requirePassingGrade}
            onCheckedChange={(checked) => updateSetting('requirePassingGrade', checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderScheduling = () => (
    <div className="space-y-6">
      <div>
        <Label>Start Date & Time</Label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {settings.scheduling?.startDate ? format(settings.scheduling.startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={settings.scheduling?.startDate}
                onSelect={(date) => updateSetting('scheduling', {
                  ...settings.scheduling,
                  startDate: date
                })}
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            value={settings.scheduling?.startDate ? format(settings.scheduling.startDate, "HH:mm") : ""}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':');
              const newDate = settings.scheduling?.startDate || new Date();
              newDate.setHours(parseInt(hours), parseInt(minutes));
              updateSetting('scheduling', {
                ...settings.scheduling,
                startDate: newDate
              });
            }}
          />
        </div>
      </div>

      <div>
        <Label>End Date & Time</Label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {settings.scheduling?.endDate ? format(settings.scheduling.endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={settings.scheduling?.endDate}
                onSelect={(date) => updateSetting('scheduling', {
                  ...settings.scheduling,
                  endDate: date
                })}
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            value={settings.scheduling?.endDate ? format(settings.scheduling.endDate, "HH:mm") : ""}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':');
              const newDate = settings.scheduling?.endDate || new Date();
              newDate.setHours(parseInt(hours), parseInt(minutes));
              updateSetting('scheduling', {
                ...settings.scheduling,
                endDate: newDate
              });
            }}
          />
        </div>
      </div>

      <div>
        <Label>Time Zone</Label>
        <Select
          value={settings.scheduling?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone}
          onValueChange={(value) => updateSetting('scheduling', {
            ...settings.scheduling,
            timeZone: value
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UTC">UTC</SelectItem>
            <SelectItem value="America/New_York">Eastern Time</SelectItem>
            <SelectItem value="America/Chicago">Central Time</SelectItem>
            <SelectItem value="America/Denver">Mountain Time</SelectItem>
            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderProctoring = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label>Enable Proctoring</Label>
        <Switch
          checked={settings.proctoring?.enabled || false}
          onCheckedChange={(checked) => updateSetting('proctoring', {
            ...settings.proctoring,
            enabled: checked
          })}
        />
      </div>

      {settings.proctoring?.enabled && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Require Webcam</Label>
            <Switch
              checked={settings.proctoring?.webcamRequired || false}
              onCheckedChange={(checked) => updateSetting('proctoring', {
                ...settings.proctoring,
                webcamRequired: checked
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Screen Recording</Label>
            <Switch
              checked={settings.proctoring?.screenRecording || false}
              onCheckedChange={(checked) => updateSetting('proctoring', {
                ...settings.proctoring,
                screenRecording: checked
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Prevent Tab Switching</Label>
            <Switch
              checked={settings.proctoring?.tabSwitching || false}
              onCheckedChange={(checked) => updateSetting('proctoring', {
                ...settings.proctoring,
                tabSwitching: checked
              })}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderAccessibility = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label>Extended Time</Label>
        <Switch
          checked={settings.accessibility?.extendedTime || false}
          onCheckedChange={(checked) => updateSetting('accessibility', {
            ...settings.accessibility,
            extendedTime: checked
          })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Screen Reader Support</Label>
        <Switch
          checked={settings.accessibility?.screenReader || false}
          onCheckedChange={(checked) => updateSetting('accessibility', {
            ...settings.accessibility,
            screenReader: checked
          })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>High Contrast Mode</Label>
        <Switch
          checked={settings.accessibility?.highContrast || false}
          onCheckedChange={(checked) => updateSetting('accessibility', {
            ...settings.accessibility,
            highContrast: checked
          })}
        />
      </div>

      <div>
        <Label>Font Size</Label>
        <Select
          value={settings.accessibility?.fontSize || 'normal'}
          onValueChange={(value) => updateSetting('accessibility', {
            ...settings.accessibility,
            fontSize: value as 'normal' | 'large' | 'extra-large'
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="extra-large">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Quiz Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">
              <Clock className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="scheduling">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Scheduling
            </TabsTrigger>
            <TabsTrigger value="proctoring">
              <Shield className="h-4 w-4 mr-2" />
              Proctoring
            </TabsTrigger>
            <TabsTrigger value="accessibility">
              <Accessibility className="h-4 w-4 mr-2" />
              Accessibility
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            {renderGeneralSettings()}
          </TabsContent>

          <TabsContent value="scheduling">
            {renderScheduling()}
          </TabsContent>

          <TabsContent value="proctoring">
            {renderProctoring()}
          </TabsContent>

          <TabsContent value="accessibility">
            {renderAccessibility()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
