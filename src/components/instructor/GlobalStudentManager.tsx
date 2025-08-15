'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/data/storage';
import { User } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, Mail, CheckCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GlobalStudentManagerProps {
  instructorId: string;
  onStudentSelect?: (students: User[]) => void;
  selectedStudents?: string[];
  showOnlyApproved?: boolean;
}

export default function GlobalStudentManager({ 
  instructorId, 
  onStudentSelect, 
  selectedStudents = [],
  showOnlyApproved = false
}: GlobalStudentManagerProps) {
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [selected, setSelected] = useState<string[]>(selectedStudents);
  const [showApprovedOnly, setShowApprovedOnly] = useState(showOnlyApproved);

  useEffect(() => {
    loadStudents();
  }, [instructorId, showApprovedOnly]);

  const loadStudents = () => {
    try {
      console.log('Loading students for instructor:', instructorId);
      
      const courses = storage.getCourses().filter(c => c.instructorId === instructorId);
      const uniqueStudents = new Map<string, User>();
      
      courses.forEach(course => {
        const students = storage.getStudentsForCourse(course.id);
        students.enrolled.forEach(student => {
          uniqueStudents.set(student.id, student);
        });
      });
      
      const allStudentsList = Array.from(uniqueStudents.values());
      setAllStudents(allStudentsList);
      
      // Filter based on approval status
      const filtered = showApprovedOnly 
        ? allStudentsList.filter(student => student.isApproved === true)
        : allStudentsList;
      
      setFilteredStudents(filtered);
      
      console.log(`Found ${allStudentsList.length} total students, ${filtered.length} ${showApprovedOnly ? 'approved' : 'total'}`);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    }
  };

  const handleToggleStudent = (studentId: string) => {
    const newSelected = selected.includes(studentId)
      ? selected.filter(id => id !== studentId)
      : [...selected, studentId];
    
    setSelected(newSelected);
    onStudentSelect?.(filteredStudents.filter(s => newSelected.includes(s.id)));
  };

  const handleToggleFilter = () => {
    setShowApprovedOnly(!showApprovedOnly);
  };

  const getStudentStatusBadge = (student: User) => {
    if (student.isApproved === true) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {showApprovedOnly ? 'Approved Students' : 'All Students'} ({filteredStudents.length})
          </span>
          <Button
            size="sm"
            variant={showApprovedOnly ? "default" : "outline"}
            onClick={handleToggleFilter}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            {showApprovedOnly ? 'Show All' : 'Show Approved'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
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
                {getStudentStatusBadge(student)}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <UserIcon className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {showApprovedOnly ? 'No approved students found' : 'No students found'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {showApprovedOnly 
                  ? 'Students will appear here after they are approved by an administrator.' 
                  : 'No students are currently enrolled in your courses.'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
