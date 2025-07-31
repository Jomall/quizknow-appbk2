'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/data/storage';
import { ContentStorage } from '@/lib/data/content-storage';
import { QuizStorage } from '@/lib/data/quiz-storage';
import { InstructorRequestStorage } from '@/lib/data/instructor-request-storage';
import { ContentItem, Quiz, InstructorAnalytics } from '@/lib/types/enhanced';
import type { User, InstructorRequest, Course } from '@/lib/types';
import ContentUploader from '@/components/instructor/ContentUploader';
import StudentGradesView from '@/components/instructor/StudentGradesView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Video, 
  Image, 
  Music, 
  Mic, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Mail,
  UserPlus,
  UserCheck,
  UserX,
  User as UserIcon,
  BookOpen
} from 'lucide-react';

export default function InstructorDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [requests, setRequests] = useState<InstructorRequest[]>([]);
  const [students, setStudents] = useState<{[courseId: string]: {enrolled: User[], pending: any[]}}>({});
  const [analytics, setAnalytics] = useState<InstructorAnalytics>({
    totalCourses: 0,
    totalStudents: 0,
    totalQuizzes: 0,
    averageQuizScore: 0,
    activeSubmissions: 0,
    pendingGrades: 0
  });

  useEffect(() => {
    const user = storage.getCurrentUser();
    if (!user || user.role !== 'instructor') {
      router.push('/login');
      return;
    }
    
    // Check if instructor is approved
    if (!user.isApproved) {
      router.push('/login');
      return;
    }
    
    setCurrentUser(user);
    loadDashboardData(user.id);
  }, [router]);

  const loadDashboardData = async (instructorId: string) => {
    // Load courses
    const allCourses = storage.getCourses();
    const instructorCourses = allCourses.filter(course => course.instructorId === instructorId);
    setCourses(instructorCourses);

    // Load content
    const instructorContent = ContentStorage.getContentByCourse(instructorCourses.map(c => c.id).join(','));
    setContent(instructorContent);

    // Load quizzes
    const instructorQuizzes = QuizStorage.getQuizzesByCourse(instructorCourses.map(c => c.id).join(','));
    setQuizzes(instructorQuizzes);

    // Load requests
    const instructorRequests = InstructorRequestStorage.getRequestsForInstructor(instructorId);
    setRequests(instructorRequests);

    // Load students for each course
    const studentsData: {[courseId: string]: {enrolled: User[], pending: any[]}} = {};
    instructorCourses.forEach(course => {
      studentsData[course.id] = storage.getStudentsForCourse(course.id);
    });
    setStudents(studentsData);

    // Calculate analytics
    const analytics = QuizStorage.getInstructorAnalytics(instructorId);
    setAnalytics(analytics);
  };

  const getContentIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'voice-note': return <Mic className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getQuizStatusColor = (status: Quiz['isPublished']) => {
    return status ? 'default' : 'secondary';
  };

  const handleRequestResponse = (requestId: string, status: 'accepted' | 'declined') => {
    if (!currentUser) return;
    
    const updatedRequest = InstructorRequestStorage.updateRequestStatus(requestId, status, currentUser.id);
    if (updatedRequest) {
      // Reload requests
      const instructorRequests = InstructorRequestStorage.getRequestsForInstructor(currentUser.id);
      setRequests(instructorRequests);
    }
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    router.push('/');
  };

  const handleRemoveStudent = (studentId: string, courseId: string) => {
    if (!currentUser) return;
    
    // Remove student from course
    const success = storage.removeStudentFromCourse(studentId, courseId);
    if (success) {
      // Reload dashboard data to reflect changes
      loadDashboardData(currentUser.id);
    }
  };

  const handlePendingStudent = (studentId: string, courseId: string) => {
    if (!currentUser) return;
    
    // Place student in pending status
    const success = storage.addPendingStudent(studentId, courseId, "Instructor action");
    if (success) {
      // Reload dashboard data to reflect changes
      loadDashboardData(currentUser.id);
    }
  };

  const handleApproveStudent = (studentId: string, courseId: string) => {
    if (!currentUser) return;
    
    // Approve pending student
    const success = storage.approvePendingStudent(studentId, courseId);
    if (success) {
      // Reload dashboard data to reflect changes
      loadDashboardData(currentUser.id);
    }
  };

  const handleRemovePendingStudent = (studentId: string, courseId: string) => {
    if (!currentUser) return;
    
    // Remove pending student
    const success = storage.removePendingStudent(studentId, courseId);
    if (success) {
      // Reload dashboard data to reflect changes
      loadDashboardData(currentUser.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your courses, content, and student progress</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/instructor/courses')}>
              Manage Courses
            </Button>
            <Button onClick={() => router.push('/instructor/create-quiz')}>
              Create Quiz
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl">{analytics.totalCourses}</CardTitle>
              <CardDescription>Total Courses</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl">{analytics.totalStudents}</CardTitle>
              <CardDescription>Total Students</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl">{analytics.totalQuizzes}</CardTitle>
              <CardDescription>Total Quizzes</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl">{analytics.averageQuizScore.toFixed(1)}%</CardTitle>
              <CardDescription>Average Quiz Score</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="requests">Student Requests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Content</CardTitle>
                  <CardDescription>Latest uploaded materials</CardDescription>
                </CardHeader>
                <CardContent>
                  {content.slice(0, 5).map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        {getContentIcon(item.type)}
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getQuizStatusColor(item.isPublic)}>
                          {item.isPublic ? 'Published' : 'Draft'}
                        </Badge>
                        {item.assignedStudents && item.assignedStudents.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {item.assignedStudents.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {content.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No content uploaded yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Quizzes */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Quizzes</CardTitle>
                  <CardDescription>Latest quiz activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {quizzes.slice(0, 5).map(quiz => (
                    <div key={quiz.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{quiz.title}</p>
                        <p className="text-sm text-gray-600">{quiz.questions.length} questions</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getQuizStatusColor(quiz.isPublished)}>
                          {quiz.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        {quiz.assignedStudents && quiz.assignedStudents.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {quiz.assignedStudents.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {quizzes.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No quizzes created yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Management</CardTitle>
                    <CardDescription>Manage your course materials</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {content.map(item => (
                        <Card key={item.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{item.title}</CardTitle>
                              {getContentIcon(item.type)}
                            </div>
                            <CardDescription>{item.type}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <div className="flex justify-between items-center">
                              <Badge variant={getQuizStatusColor(item.isPublic)}>
                                {item.isPublic ? 'Published' : 'Draft'}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {Math.round((item.fileSize || 0) / 1024)} KB
                              </span>
                            </div>
                            {item.assignedStudents && item.assignedStudents.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-500">Assigned to {item.assignedStudents.length} student(s)</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <ContentUploader 
                  courseId={courses[0]?.id || ''} 
                  instructorId={currentUser?.id || ''} 
                  onUploadComplete={() => currentUser?.id && loadDashboardData(currentUser.id)} 
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Management</CardTitle>
                <CardDescription>Manage your course quizzes and assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quizzes.map(quiz => (
                    <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{quiz.title}</CardTitle>
                          <Badge variant={getQuizStatusColor(quiz.isPublished)}>
                            {quiz.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <CardDescription>{quiz.questions.length} questions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {quiz.questions.length} questions
                          </span>
                          <span className="text-sm font-medium">
                            {quiz.passingScore || 70}% passing
                          </span>
                        </div>
                        {quiz.assignedStudents && quiz.assignedStudents.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Assigned to {quiz.assignedStudents.length} student(s)</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {quizzes.length === 0 && (
                    <p className="text-gray-500 text-center py-4 col-span-full">No quizzes created yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>Manage enrolled students across your courses</CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length > 0 ? (
                  <div className="space-y-6">
                    {courses.map(course => (
                      <div key={course.id} className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-3">{course.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Enrolled Students ({students[course.id]?.enrolled.length || 0})</h4>
                            {students[course.id]?.enrolled.length > 0 ? (
                              <div className="space-y-3">
                                {students[course.id]?.enrolled.map(student => (
                                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-md">
                                    <div className="flex items-center space-x-3">
                                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                                      <div>
                                        <p className="font-medium text-sm">{student.name}</p>
                                        <p className="text-xs text-gray-500">{student.email}</p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleRemoveStudent(student.id, course.id)}
                                      >
                                        Remove
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="secondary"
                                        onClick={() => handlePendingStudent(student.id, course.id)}
                                      >
                                        Pending
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">No students enrolled in this course</p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Pending Students ({students[course.id]?.pending.length || 0})</h4>
                            {students[course.id]?.pending.length > 0 ? (
                              <div className="space-y-3">
                                {students[course.id]?.pending.map((pending, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-yellow-50">
                                    <div className="flex items-center space-x-3">
                                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                                      <div>
                                        <p className="font-medium text-sm">Pending Student</p>
                                        <p className="text-xs text-gray-500">Pending approval</p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleApproveStudent(pending.studentId, course.id)}
                                      >
                                        Approve
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => handleRemovePendingStudent(pending.studentId, course.id)}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">No pending students for this course</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserIcon className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
                    <p className="mt-1 text-sm text-gray-500">You don't have any courses yet. Create a course to start managing students.</p>
                    <div className="mt-6">
                      <Button onClick={() => router.push('/instructor/courses')}>
                        Create Course
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Student Grades
                </CardTitle>
                <CardDescription>View all student quiz submissions and grades</CardDescription>
              </CardHeader>
              <CardContent>
                {currentUser ? (
                  <StudentGradesView instructorId={currentUser.id} />
                ) : (
                  <div className="flex justify-center items-center h-64">
                    Loading grades data...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Student Connection Requests
                </CardTitle>
                <CardDescription>Manage requests from students to connect with you</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length > 0 ? (
                  <div className="space-y-4">
                    {requests.map(request => {
                      const student = storage.getUsers().find(user => user.id === request.studentId);
                      return (
                        <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                            <div>
                              <p className="font-medium">
                                {student ? student.name : 'Unknown Student'}
                              </p>
                              <p className="text-sm text-gray-600">{request.message || 'No message'}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(request.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {request.status === 'pending' ? (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  onClick={() => handleRequestResponse(request.id, 'accepted')}
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleRequestResponse(request.id, 'declined')}
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                              </>
                            ) : (
                              <Badge variant={request.status === 'accepted' ? 'default' : 'destructive'}>
                                {request.status === 'accepted' ? 'Accepted' : 'Declined'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
                    <p className="mt-1 text-sm text-gray-500">Students will appear here when they request to connect with you.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Detailed insights into your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={analytics.averageQuizScore} className="w-full mb-2" />
                      <p className="text-sm text-gray-600">Average quiz score: {analytics.averageQuizScore}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Submissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{analytics.activeSubmissions}</p>
                      <p className="text-sm text-gray-600">Pending review</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Grades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{analytics.pendingGrades}</p>
                      <p className="text-sm text-gray-600">Need grading</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{analytics.totalStudents}</p>
                      <p className="text-sm text-gray-600">Enrolled across all courses</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
