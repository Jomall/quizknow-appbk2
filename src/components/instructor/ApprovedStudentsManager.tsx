'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/data/storage';
import { User } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ApprovedStudentsManagerProps {
  instructorId: string;
  onStudentSelect?: (students: User[]) => void;
  selectedStudents?: string[];
  refreshTrigger?: number;
}

export default function ApprovedStudentsManager({ 
  instructorId, 
  onStudentSelect, 
  selectedStudents = [],
  refreshTrigger = 0
}: ApprovedStudentsManagerProps) {
  const [approvedStudents, setApprovedStudents] = useState<User[]>([]);
  const [selected, setSelected] = useState<string[]>(selectedStudents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovedStudents();
  }, [instructorId, refreshTrigger]);

  const loadApprovedStudents = () => {
    setLoading(true);
    try {
      console.log('Loading approved students for instructor:', instructorId);
      
      // Get all users and filter for approved students
      const allUsers = storage.getUsers();
      const approvedUsers = allUsers.filter(user => 
        user.role === 'student' && user.isApproved === true
      );

      // Get courses for this instructor
      const courses = storage.getCourses().filter(c => c.instructorId === instructorId);
      
      // Find students enrolled in any of the instructor's courses
      const enrolledApprovedStudents = new Map<string, User>();
      
      courses.forEach(course => {
        const students = storage.getStudentsForCourse(course.id);
        students.enrolled.forEach(student => {
          // Only include approved students
          if (approvedUsers.some(approved => approved.id === student.id)) {
            enrolledApprovedStudents.set(student.id, student);
          }
        });
      });
      
      const approvedList = Array.from(enrolledApprovedStudents.values());
      setApprovedStudents(approvedList);
      
      console.log('Found approved students:', approvedList.length);
    } catch (error) {
      console.error('Error loading approved students:', error);
      toast.error('Failed to load approved students');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStudent = (studentId: string) => {
    const newSelected = selected.includes(studentId)
      ? selected.filter(id => id !== studentId)
      : [...selected, studentId];
    
    setSelected(newSelected);
    onStudentSelect?.(approvedStudents.filter(s => newSelected.includes(s.id)));
  };

  const handleRefresh = () => {
    loadApprovedStudents();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approved Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Approved Students ({approvedStudents.length})</span>
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvedStudents.length > 0 ? (
            approvedStudents.map(student => (
              <div 
                key={student.id} 
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                  selected.includes(student.id) 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => handleToggleStudent(student.id)}
              >
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3" />
                  </Badge>
                  {selected.includes(student.id) && (
                    <Badge variant="default">Selected</Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <UserIcon className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No approved students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Students will appear here after they are approved by an administrator.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
