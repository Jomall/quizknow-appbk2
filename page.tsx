'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/data/storage';
import { ContentStorage } from '@/lib/data/content-storage';
import { QuizStorage } from '@/lib/data/quiz-storage';
import { ContentItem, Quiz, InstructorAnalytics } from '@/lib/types/enhanced';
import ContentUploader from '@/components/instructor/ContentUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Video, Image, Music, Mic, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function InstructorDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
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
            <Button variant="outline" onClick={() => storage.setCurrentUser(null)}>
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
                      <Badge variant={getQuizStatusColor(item.isPublic)}>
                        {item.isPublic ? 'Published' : 'Draft'}
                      </Badge>
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
                      <Badge variant={getQuizStatusColor(quiz.isPublished)}>
                        {quiz.isPublished ? 'Published' : 'Draft'}
                      </Badge>
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
                  onUploadComplete={() => loadDashboardData(currentUser?.id)} 
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
