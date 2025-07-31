'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/data/storage';
import { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User as UserIcon } from 'lucide-react';

interface StudentSelectorProps {
  courseId: string;
  selectedStudents: string[];
  onStudentSelectionChange: (studentIds: string[]) => void;
}

export default function StudentSelector({ 
  courseId, 
  selectedStudents, 
  onStudentSelectionChange 
}: StudentSelectorProps) {
  const [students, setStudents] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);

  useEffect(() => {
    // Load students for the course
    const courseStudents = storage.getStudentsForCourse(courseId);
    setStudents(courseStudents.enrolled);
    setFilteredStudents(courseStudents.enrolled);
  }, [courseId]);

  useEffect(() => {
    // Filter students based on search term
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredStudents(
        students.filter(student => 
          student.name.toLowerCase().includes(term) || 
          student.email.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, students]);

  const handleStudentToggle = (studentId: string) => {
    const newSelectedStudents = selectedStudents.includes(studentId)
      ? selectedStudents.filter(id => id !== studentId)
      : [...selectedStudents, studentId];
    
    onStudentSelectionChange(newSelectedStudents);
  };

  const selectAllStudents = () => {
    onStudentSelectionChange(filteredStudents.map(student => student.id));
  };

  const deselectAllStudents = () => {
    onStudentSelectionChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Assign to Students
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectAllStudents}
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={deselectAllStudents}
          >
            Deselect All
          </Button>
        </div>

        {filteredStudents.length > 0 ? (
          <ScrollArea className="h-64 border rounded-md p-2">
            <div className="space-y-2">
              {filteredStudents.map(student => (
                <div 
                  key={student.id} 
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100"
                >
                  <Checkbox
                    id={`student-${student.id}`}
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={() => handleStudentToggle(student.id)}
                  />
                  <Label 
                    htmlFor={`student-${student.id}`} 
                    className="flex items-center space-x-3 cursor-pointer flex-1"
                  >
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <UserIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No students found</p>
          </div>
        )}

        <div className="text-sm text-gray-600">
          Selected: {selectedStudents.length} of {students.length} students
        </div>
      </CardContent>
    </Card>
  );
}
