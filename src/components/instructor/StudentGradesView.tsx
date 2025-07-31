'use client';

import { useState, useEffect } from 'react';
import { QuizStorage } from '@/lib/data/quiz-storage';
import { storage } from '@/lib/data/storage';
import { GradeBookEntry } from '@/lib/types/enhanced';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User
} from 'lucide-react';

interface StudentGrades {
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  grades: GradeBookEntry[];
  averageScore: number;
  totalQuizzes: number;
  submittedQuizzes: number;
}

export default function StudentGradesView({ instructorId }: { instructorId: string }) {
  const [studentGrades, setStudentGrades] = useState<StudentGrades[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentGrades();
  }, [instructorId]);

  const loadStudentGrades = () => {
    try {
      // Get all gradebook entries for this instructor
      const allGradebookEntries = QuizStorage.getGradebook();
      const instructorEntries = allGradebookEntries.filter(entry => entry.instructorId === instructorId);
      
      // Group entries by student
      const gradesByStudent: { [key: string]: StudentGrades } = {};
      
      instructorEntries.forEach(entry => {
        const studentKey = `${entry.studentId}-${entry.courseId}`;
        
        if (!gradesByStudent[studentKey]) {
          gradesByStudent[studentKey] = {
            studentId: entry.studentId,
            studentName: entry.studentName,
            courseId: entry.courseId,
            courseTitle: entry.courseTitle,
            grades: [],
            averageScore: 0,
            totalQuizzes: 0,
            submittedQuizzes: 0
          };
        }
        
        gradesByStudent[studentKey].grades.push(entry);
      });
      
      // Calculate statistics for each student
      const studentGradesArray = Object.values(gradesByStudent).map(studentGrade => {
        const totalScore = studentGrade.grades.reduce((sum, entry) => sum + entry.score, 0);
        const maxScore = studentGrade.grades.reduce((sum, entry) => sum + entry.maxScore, 0);
        const averageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        
        // Get total quizzes for this course
        const courses = storage.getCourses();
        const course = courses.find(c => c.id === studentGrade.courseId);
        const courseQuizzes = course ? QuizStorage.getQuizzesByCourse(course.id) : [];
        
        return {
          ...studentGrade,
          averageScore,
          totalQuizzes: courseQuizzes.length,
          submittedQuizzes: studentGrade.grades.length
        };
      });
      
      setStudentGrades(studentGradesArray);
      setLoading(false);
    } catch (error) {
      console.error('Error loading student grades:', error);
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading student grades...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentGrades.length}</div>
            <p className="text-xs text-muted-foreground">with submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentGrades.length > 0 
                ? Math.round(studentGrades.reduce((sum, student) => sum + (student.submittedQuizzes / student.totalQuizzes * 100), 0) / studentGrades.length) || 0
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">of assigned quizzes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentGrades.length > 0 
                ? Math.round(studentGrades.reduce((sum, student) => sum + student.averageScore, 0) / studentGrades.length) || 0
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">across all submissions</p>
          </CardContent>
        </Card>
      </div>

      {studentGrades.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Student Submissions</h3>
            <p className="text-muted-foreground text-center">
              Students have not submitted any quizzes yet. 
              <br />Check back when students complete their assignments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {studentGrades.map((student) => (
            <Card key={`${student.studentId}-${student.courseId}`}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{student.studentName}</CardTitle>
                      <CardDescription>{student.courseTitle}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Quizzes:</span>
                      <Badge variant="secondary">
                        {student.submittedQuizzes}/{student.totalQuizzes} submitted
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Avg Score:</span>
                      <Badge className={getScoreColor(student.averageScore)}>
                        {Math.round(student.averageScore)}%
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quiz Completion</span>
                    <span>{Math.round((student.submittedQuizzes / student.totalQuizzes) * 100) || 0}%</span>
                  </div>
                  <Progress 
                    value={(student.submittedQuizzes / student.totalQuizzes) * 100} 
                    className="w-full" 
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Quiz Submissions</h4>
                  {student.grades.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No quiz submissions yet</p>
                  ) : (
                    <div className="space-y-3">
                      {student.grades.map((entry) => (
                        <div 
                          key={entry.id} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{entry.quizTitle}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                Submitted: {formatDate(entry.submittedAt)}
                              </span>
                              {entry.status === 'graded' && (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 sm:mt-0">
                            <div className="text-right">
                              <p className={`font-medium ${getScoreColor(entry.percentage)}`}>
                                {entry.score} / {entry.maxScore}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {Math.round(entry.percentage)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
