'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/data/storage';
import { InstructorRequestStorage } from '@/lib/data/instructor-request-storage';
import { ContentStorage } from '@/lib/data/content-storage';
import { QuizStorage } from '@/lib/data/quiz-storage';
import { User, InstructorRequest } from '@/lib/types';
import { ContentItem, Quiz } from '@/lib/types/enhanced';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  UserPlus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Mail, 
  Calendar,
  BookOpen,
  FileText,
  Video,
  Image,
  Music,
  Mic,
  Play,
  Download,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

export default function StudentDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [connectedInstructors, setConnectedInstructors] = useState<User[]>([]);
  const [requests, setRequests] = useState<InstructorRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  
  // Pagination states
  const [contentPage, setContentPage] = useState(1);
  const [quizzesPage, setQuizzesPage] = useState(1);
  const [gradesPage, setGradesPage] = useState(1);
  const [instructorsPage, setInstructorsPage] = useState(1);
  const [connectedInstructorsPage, setConnectedInstructorsPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);
  
  // Items per page
  const itemsPerPage = 5;

  useEffect(() => {
    const user = storage.getCurrentUser();
    if (!user || user.role !== 'student') {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    loadInstructors();
    loadRequests(user.id);
    loadGrades(user.id);
    loadConnectedInstructors(user);
    loadContentAndQuizzes();
  }, [router]);

  const loadContentAndQuizzes = () => {
    // Load content assigned to the student
    if (currentUser) {
      const studentContent = ContentStorage.getContentForStudent(currentUser.id);
      setContentItems(studentContent);

      // Load quizzes assigned to the student
      const studentQuizzes = QuizStorage.getQuizzesForStudent(currentUser.id);
      setQuizzes(studentQuizzes);
    }
  };

  const loadInstructors = () => {
    const users = storage.getUsers();
    const instructorUsers = users.filter(user => user.role === 'instructor');
    setInstructors(instructorUsers);
  };

  const loadConnectedInstructors = (user: User) => {
    const allUsers = storage.getUsers();
    const connectedInstructorIds = user.connectedInstructors || [];
    const connectedInstructorUsers = allUsers.filter(u => 
      u.role === 'instructor' && connectedInstructorIds.includes(u.id)
    );
    setConnectedInstructors(connectedInstructorUsers);
  };

  const loadRequests = (studentId: string) => {
    const studentRequests = InstructorRequestStorage.getRequestsForStudent(studentId);
    setRequests(studentRequests);
  };

  const loadGrades = (studentId: string) => {
    const studentGrades = QuizStorage.getGradebookByStudent(studentId);
    setGrades(studentGrades);
  };

  const handleRequestConnection = () => {
    if (!selectedInstructor) {
      toast.error('Please select an instructor');
      return;
    }
    
    if (!currentUser) return;
    
    const request = InstructorRequestStorage.createRequest(currentUser.id, selectedInstructor, message);
    if (request) {
      toast.success('Request sent successfully!');
      setMessage('');
      setSelectedInstructor('');
      loadRequests(currentUser.id);
      // Reload content and quizzes in case a request was accepted
      loadContentAndQuizzes();
    } else {
      toast.error('Failed to send request. You may have already sent a request to this instructor.');
    }
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    router.push('/');
  };

  const getStatusBadge = (status: InstructorRequest['status']) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" /> Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Declined</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  const getContentIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5 text-red-500" />;
      case 'image': return <Image className="h-5 w-5 text-green-500" />;
      case 'audio': return <Music className="h-5 w-5 text-yellow-500" />;
      case 'voice-note': return <Mic className="h-5 w-5 text-purple-500" />;
      case 'document': return <FileText className="h-5 w-5 text-blue-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const viewContent = (content: ContentItem) => {
    if (content.fileUrl) {
      // For file-based content, open in a new tab
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${content.title}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .container { max-width: 800px; margin: 0 auto; }
                .header { margin-bottom: 20px; }
                .content { width: 100%; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${content.title}</h1>
                  <p>${content.description || 'No description provided'}</p>
                </div>
                ${getContentViewer(content)}
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } else if (content.externalUrl) {
      // For external URLs, open in a new tab
      window.open(content.externalUrl, '_blank');
    }
  };

  const getContentViewer = (content: ContentItem) => {
    if (!content.fileUrl) return '<p>No content available</p>';
    
    switch (content.type) {
      case 'video':
        return `<video controls class="content"><source src="${content.fileUrl}" type="${content.fileType}">Your browser does not support the video tag.</video>`;
      case 'image':
        return `<img src="${content.fileUrl}" alt="${content.title}" class="content" style="max-width: 100%; height: auto;" />`;
      case 'audio':
        return `<audio controls class="content"><source src="${content.fileUrl}" type="${content.fileType}">Your browser does not support the audio tag.</audio>`;
      case 'document':
        if (content.fileType === 'application/pdf') {
          return `<embed src="${content.fileUrl}" type="application/pdf" width="100%" height="600px" />`;
        }
        return `<iframe src="${content.fileUrl}" class="content" style="width: 100%; height: 600px;"></iframe>`;
      default:
        return `<a href="${content.fileUrl}" download="${content.title}" class="content">Download ${content.title}</a>`;
    }
  };

  const startQuiz = (quiz: Quiz) => {
    // In a real application, this would navigate to the quiz page
    // For now, we'll show a toast message
    toast.info(`Quiz "${quiz.title}" would start now. In a full implementation, this would navigate to the quiz page.`);
  };

  const filteredInstructors = instructors.filter(instructor => 
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="flex space-x-4 mb-6">
          <Button 
            variant={activeTab === 'dashboard' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('dashboard')}
          >
            <Users className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button 
            variant={activeTab === 'materials' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('materials')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Learning Materials
          </Button>
          <Button 
            variant={activeTab === 'grades' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('grades')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Grades
          </Button>
          <Button 
            variant={activeTab === 'instructors' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('instructors')}
          >
            <Users className="h-4 w-4 mr-2" />
            My Instructors
          </Button>
          <Button 
            variant={activeTab === 'connect' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('connect')}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Connect with Instructors
          </Button>
          <Button 
            variant={activeTab === 'requests' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('requests')}
          >
            <Mail className="h-4 w-4 mr-2" />
            My Requests
          </Button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Enrolled courses and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">View your enrolled courses and track your learning progress.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>Pending and completed assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Submit assignments and view your grades.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discussions</CardTitle>
                <CardDescription>Course forums and discussions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Participate in course discussions and ask questions.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Content from Instructors
                </CardTitle>
                <CardDescription>Learning materials shared by your instructors</CardDescription>
              </CardHeader>
              <CardContent>
                {contentItems.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {contentItems
                        .slice((contentPage - 1) * itemsPerPage, contentPage * itemsPerPage)
                        .map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                              {getContentIcon(item.type)}
                              <div>
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-gray-600">{item.description || 'No description'}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(item.uploadedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => viewContent(item)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        ))}
                    </div>
                    {/* Pagination controls */}
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        onClick={() => setContentPage(prev => Math.max(prev - 1, 1))}
                        disabled={contentPage === 1}
                        variant="outline"
                        size="sm"
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {contentPage} of {Math.ceil(contentItems.length / itemsPerPage)}
                      </span>
                      <Button
                        onClick={() => setContentPage(prev => 
                          Math.min(prev + 1, Math.ceil(contentItems.length / itemsPerPage))
                        )}
                        disabled={contentPage === Math.ceil(contentItems.length / itemsPerPage)}
                        variant="outline"
                        size="sm"
                      >
                        Next
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No content available</h3>
                    <p className="mt-1 text-sm text-gray-500">Your instructors haven't shared any content with you yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Quizzes from Instructors
                </CardTitle>
                <CardDescription>Assessments created by your instructors</CardDescription>
              </CardHeader>
              <CardContent>
                {quizzes.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {quizzes
                        .slice((quizzesPage - 1) * itemsPerPage, quizzesPage * itemsPerPage)
                        .map(quiz => (
                          <div key={quiz.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div>
                              <p className="font-medium">{quiz.title}</p>
                              <p className="text-sm text-gray-600">{quiz.description || 'No description'}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <span className="mr-2">{quiz.questions.length} questions</span>
                                <span>•</span>
                                <Calendar className="h-3 w-3 mx-1" />
                                {new Date(quiz.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Button size="sm" variant="default" onClick={() => startQuiz(quiz)}>
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          </div>
                        ))}
                    </div>
                    {/* Pagination controls */}
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        onClick={() => setQuizzesPage(prev => Math.max(prev - 1, 1))}
                        disabled={quizzesPage === 1}
                        variant="outline"
                        size="sm"
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {quizzesPage} of {Math.ceil(quizzes.length / itemsPerPage)}
                      </span>
                      <Button
                        onClick={() => setQuizzesPage(prev => 
                          Math.min(prev + 1, Math.ceil(quizzes.length / itemsPerPage))
                        )}
                        disabled={quizzesPage === Math.ceil(quizzes.length / itemsPerPage)}
                        variant="outline"
                        size="sm"
                      >
                        Next
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes available</h3>
                    <p className="mt-1 text-sm text-gray-500">Your instructors haven't created any quizzes for you yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'grades' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                My Grades
              </CardTitle>
              <CardDescription>View your grades by course and quiz</CardDescription>
            </CardHeader>
            <CardContent>
              {grades.length > 0 ? (
                <>
                  <div className="space-y-6">
                    {/* Group grades by course */}
                    {[...new Set(grades.map(grade => grade.courseId))].map(courseId => {
                      const courseGrades = grades.filter(grade => grade.courseId === courseId);
                      const course = courseGrades[0]; // All grades in this group have the same course info
                      
                      // Paginate course grades
                      const paginatedCourseGrades = courseGrades.slice(
                        (gradesPage - 1) * itemsPerPage,
                        gradesPage * itemsPerPage
                      );
                      
                      return (
                        <div key={courseId} className="border rounded-lg">
                          <div className="bg-gray-50 px-4 py-3 border-b">
                            <h3 className="font-semibold text-lg">{course.courseTitle}</h3>
                            <p className="text-sm text-gray-600">Instructor: {course.instructorName}</p>
                          </div>
                          <div className="p-4">
                            <div className="space-y-3">
                              {paginatedCourseGrades.map(grade => (
                                <div key={grade.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                                  <div>
                                    <p className="font-medium">{grade.quizTitle}</p>
                                    <div className="flex items-center text-sm text-gray-600 mt-1">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      <span>Graded on {new Date(grade.gradedAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">{grade.score} / {grade.maxScore}</p>
                                    <p className="text-sm text-gray-600">{grade.percentage.toFixed(1)}%</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Pagination controls */}
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      onClick={() => setGradesPage(prev => Math.max(prev - 1, 1))}
                      disabled={gradesPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {gradesPage} of {Math.ceil(grades.length / itemsPerPage)}
                    </span>
                    <Button
                      onClick={() => setGradesPage(prev => 
                        Math.min(prev + 1, Math.ceil(grades.length / itemsPerPage))
                      )}
                      disabled={gradesPage === Math.ceil(grades.length / itemsPerPage)}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No grades available</h3>
                  <p className="mt-1 text-sm text-gray-500">Your instructors haven't graded any of your submissions yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'instructors' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                My Instructors
              </CardTitle>
              <CardDescription>View instructors you're connected to</CardDescription>
            </CardHeader>
            <CardContent>
              {connectedInstructors.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connectedInstructors
                      .slice((connectedInstructorsPage - 1) * itemsPerPage, connectedInstructorsPage * itemsPerPage)
                      .map(instructor => (
                        <Card key={instructor.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                              <div>
                                <h3 className="font-semibold">{instructor.name}</h3>
                                <p className="text-sm text-gray-600">{instructor.email}</p>
                                <div className="mt-2">
                                  <Badge variant="secondary">Connected</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex space-x-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                View Courses
                              </Button>
                              <Button size="sm" variant="default" className="flex-1">
                                Message
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                  {/* Pagination controls */}
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      onClick={() => setConnectedInstructorsPage(prev => Math.max(prev - 1, 1))}
                      disabled={connectedInstructorsPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {connectedInstructorsPage} of {Math.ceil(connectedInstructors.length / itemsPerPage)}
                    </span>
                    <Button
                      onClick={() => setConnectedInstructorsPage(prev => 
                        Math.min(prev + 1, Math.ceil(connectedInstructors.length / itemsPerPage))
                      )}
                      disabled={connectedInstructorsPage === Math.ceil(connectedInstructors.length / itemsPerPage)}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No instructors connected</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by connecting with an instructor.</p>
                  <div className="mt-6">
                    <Button onClick={() => setActiveTab('connect')}>
                      Connect with Instructors
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'connect' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    Find Instructors
                  </CardTitle>
                  <CardDescription>Search and connect with instructors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label htmlFor="search">Search Instructors</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="search"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredInstructors
                      .slice((instructorsPage - 1) * itemsPerPage, instructorsPage * itemsPerPage)
                      .map(instructor => (
                        <div 
                          key={instructor.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{instructor.name}</p>
                            <p className="text-sm text-gray-600">{instructor.email}</p>
                          </div>
                          <Button
                            size="sm"
                            variant={selectedInstructor === instructor.id ? "default" : "outline"}
                            onClick={() => setSelectedInstructor(instructor.id)}
                          >
                            {selectedInstructor === instructor.id ? "Selected" : "Select"}
                          </Button>
                        </div>
                      ))}
                    {filteredInstructors.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No instructors found</p>
                    )}
                  </div>
                  {/* Pagination controls */}
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      onClick={() => setInstructorsPage(prev => Math.max(prev - 1, 1))}
                      disabled={instructorsPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {instructorsPage} of {Math.ceil(filteredInstructors.length / itemsPerPage)}
                    </span>
                    <Button
                      onClick={() => setInstructorsPage(prev => 
                        Math.min(prev + 1, Math.ceil(filteredInstructors.length / itemsPerPage))
                      )}
                      disabled={instructorsPage === Math.ceil(filteredInstructors.length / itemsPerPage)}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Request Connection
                  </CardTitle>
                  <CardDescription>Send a request to connect with an instructor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="instructor">Selected Instructor</Label>
                      <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an instructor" />
                        </SelectTrigger>
                        <SelectContent>
                          {instructors.map(instructor => (
                            <SelectItem key={instructor.id} value={instructor.id}>
                              {instructor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message">Message (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Add a message to introduce yourself..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={handleRequestConnection}
                      disabled={!selectedInstructor}
                    >
                      Send Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                My Requests
              </CardTitle>
              <CardDescription>View status of your connection requests</CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {requests
                      .slice((requestsPage - 1) * itemsPerPage, requestsPage * itemsPerPage)
                      .map(request => {
                        const instructor = instructors.find(inst => inst.id === request.id);
                        return (
                          <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                              <div>
                                <p className="font-medium">
                                  {instructor ? instructor.name : 'Unknown Instructor'}
                                </p>
                                <p className="text-sm text-gray-600">{request.message || 'No message'}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(request.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(request.status)}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  {/* Pagination controls */}
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      onClick={() => setRequestsPage(prev => Math.max(prev - 1, 1))}
                      disabled={requestsPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {requestsPage} of {Math.ceil(requests.length / itemsPerPage)}
                    </span>
                    <Button
                      onClick={() => setRequestsPage(prev => 
                        Math.min(prev + 1, Math.ceil(requests.length / itemsPerPage))
                      )}
                      disabled={requestsPage === Math.ceil(requests.length / itemsPerPage)}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by connecting with an instructor.</p>
                  <div className="mt-6">
                    <Button onClick={() => setActiveTab('connect')}>
                      Connect with Instructors
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
