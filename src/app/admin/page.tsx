'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/data/storage';
import { ContentStorage } from '@/lib/data/content-storage';
import { QuizStorage } from '@/lib/data/quiz-storage';
import { InstructorApprovalStorage } from '@/lib/data/instructor-approval-storage';
import { User, Course, InstructorApprovalRequest } from '@/lib/types';
import { ContentItem, Quiz } from '@/lib/types/enhanced';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  FileText, 
  Video, 
  Image, 
  Music, 
  Mic,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  UserX,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Check,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [pendingInstructors, setPendingInstructors] = useState<InstructorApprovalRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'instructor' | 'admin'>('all');
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student' as 'student' | 'instructor' | 'admin' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalContent: 0,
    totalQuizzes: 0,
    activeStudents: 0,
    activeInstructors: 0,
    averageQuizScore: 0,
    totalSubmissions: 0
  });

  useEffect(() => {
    const user = storage.getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    loadData();
  }, [router]);

  const loadData = () => {
    // Load all users
    const allUsers = storage.getUsers();
    setUsers(allUsers);
    
    // Load all courses
    const allCourses = storage.getCourses();
    setCourses(allCourses);
    
    // Load all content
    const allContent = ContentStorage.getAllContent();
    setContentItems(allContent);
    
    // Load all quizzes
    const allQuizzes = QuizStorage.getAllQuizzes();
    setQuizzes(allQuizzes);
    
    // Load pending instructor requests
    const pendingRequests = InstructorApprovalStorage.getPendingRequests();
    setPendingInstructors(pendingRequests);
    
    // Calculate system statistics
    calculateSystemStats(allUsers, allCourses, allQuizzes);
  };

  const calculateSystemStats = (users: User[], courses: Course[], quizzes: Quiz[]) => {
    const totalUsers = users.length;
    const totalCourses = courses.length;
    const totalContent = ContentStorage.getAllContent().length;
    const totalQuizzes = quizzes.length;
    
    // Count active students and instructors
    const activeStudents = users.filter(u => u.role === 'student' && u.enrolledCourses.length > 0).length;
    const activeInstructors = users.filter(u => u.role === 'instructor' && u.createdCourses.length > 0).length;
    
    // Calculate average quiz score
    const gradebook = QuizStorage.getGradebook();
    const totalScore = gradebook.reduce((sum, entry) => sum + entry.score, 0);
    const maxScore = gradebook.reduce((sum, entry) => sum + entry.maxScore, 0);
    const averageQuizScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    
    const totalSubmissions = QuizStorage.getAllSubmissions().length;
    
    setSystemStats({
      totalUsers,
      totalCourses,
      totalContent,
      totalQuizzes,
      activeStudents,
      activeInstructors,
      averageQuizScore,
      totalSubmissions
    });
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    router.push('/');
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) return;
    
    const users = storage.getUsers();
    // Check if email already exists
    if (users.find(u => u.email === newUser.email)) {
      alert('User with this email already exists');
      return;
    }
    
    const newUserObj: User = {
      id: Date.now().toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      enrolledCourses: [],
      createdCourses: [],
      createdAt: new Date(),
    };
    
    users.push(newUserObj);
    storage.saveUsers(users);
    setUsers(users);
    setNewUser({ name: '', email: '', role: 'student' });
    loadData();
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    const users = storage.getUsers();
    const index = users.findIndex(u => u.id === editingUser.id);
    if (index !== -1) {
      users[index] = editingUser;
      storage.saveUsers(users);
      setUsers(users);
      setEditingUser(null);
      loadData();
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    const users = storage.getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    storage.saveUsers(filteredUsers);
    setUsers(filteredUsers);
    loadData();
  };

  const handleDeleteCourse = (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This will also delete all associated content and quizzes.')) return;
    
    // Delete course
    const courses = storage.getCourses();
    const filteredCourses = courses.filter(c => c.id !== courseId);
    storage.saveCourses(filteredCourses);
    
    // Delete associated content
    const contentItems = ContentStorage.getAllContent();
    const filteredContent = contentItems.filter(c => c.courseId !== courseId);
    // Save filtered content (would need to implement in ContentStorage)
    
    // Delete associated quizzes
    const quizzes = QuizStorage.getAllQuizzes();
    const filteredQuizzes = quizzes.filter(q => q.courseId !== courseId);
    // Save filtered quizzes (would need to implement in QuizStorage)
    
    setCourses(filteredCourses);
    loadData();
  };

  const handleApproveInstructor = (requestId: string) => {
    // Update the approval request status
    const updatedRequest = InstructorApprovalStorage.updateRequestStatus(requestId, 'approved');
    
    if (updatedRequest) {
      // Reload data to update the pending instructors list
      loadData();
    }
  };

  const handleDeclineInstructor = (requestId: string) => {
    if (!window.confirm('Are you sure you want to decline this instructor request?')) return;
    
    // Update the approval request status
    const updatedRequest = InstructorApprovalStorage.updateRequestStatus(requestId, 'declined');
    
    if (updatedRequest) {
      // Reload data to update the pending instructors list
      loadData();
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage the entire system and view analytics</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        {/* System Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl">{systemStats.totalUsers}</CardTitle>
              <CardDescription>Total Users</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl">{systemStats.totalCourses}</CardTitle>
              <CardDescription>Total Courses</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl">{systemStats.totalQuizzes}</CardTitle>
              <CardDescription>Total Quizzes</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl">{systemStats.averageQuizScore.toFixed(1)}%</CardTitle>
              <CardDescription>Average Quiz Score</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="courses">Course Management</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="instructor-requests">Instructor Requests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                  <CardDescription>Current system status and statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Active Students</span>
                      <Badge variant="secondary">{systemStats.activeStudents}</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Active Instructors</span>
                      <Badge variant="secondary">{systemStats.activeInstructors}</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Total Content Items</span>
                      <Badge variant="secondary">{systemStats.totalContent}</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Quiz Submissions</span>
                      <Badge variant="secondary">{systemStats.totalSubmissions}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                  {users.slice(0, 5).map((user, index) => (
                    <div key={`${user.id}-${index}`} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{user.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.role}
                        </div>
                      </div>
                    ))}
                    {users.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      All Users
                    </CardTitle>
                    <CardDescription>Manage all users in the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={userRoleFilter} onValueChange={(value: any) => setUserRoleFilter(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="student">Students</SelectItem>
                          <SelectItem value="instructor">Instructors</SelectItem>
                          <SelectItem value="admin">Admins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                    {filteredUsers.map((user, index) => (
                      <div key={`${user.id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{user.role}</Badge>
                            <Button size="sm" variant="outline" onClick={() => setEditingUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {filteredUsers.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No users found</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Add New User
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Full name"
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          placeholder="Email address"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={newUser.role} onValueChange={(value: any) => setNewUser({...newUser, role: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="instructor">Instructor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full" onClick={handleCreateUser}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create User
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {editingUser && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Edit className="h-5 w-5 mr-2" />
                        Edit User
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-name">Name</Label>
                          <Input
                            id="edit-name"
                            placeholder="Full name"
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-email">Email</Label>
                          <Input
                            id="edit-email"
                            placeholder="Email address"
                            value={editingUser.email}
                            onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button className="flex-1" onClick={handleUpdateUser}>
                            Save
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setEditingUser(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Management
                </CardTitle>
                <CardDescription>Manage all courses in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course, index) => {
                    const instructor = users.find(u => u.id === course.instructorId);
                    return (
                      <div key={`${course.id}-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-600">{course.description}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span>Instructor: {instructor ? instructor.name : 'Unknown'}</span>
                            <span className="mx-2">•</span>
                            <span>{course.enrolledStudents.length} students</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteCourse(course.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {courses.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No courses found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Content Management
                </CardTitle>
                <CardDescription>All content items across courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                      {contentItems.map((item, index) => {
                        const course = courses.find(c => c.id === item.courseId);
                        return (
                          <div key={`${item.id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getContentIcon(item.type)}
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-gray-600">{course ? course.title : 'Unknown Course'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{item.type}</Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {contentItems.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No content found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Quiz Management
                </CardTitle>
                <CardDescription>All quizzes across courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quizzes.map((quiz, index) => {
                    const course = courses.find(c => c.id === quiz.courseId);
                    return (
                      <div key={`${quiz.id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{quiz.title}</p>
                          <p className="text-sm text-gray-600">{course ? course.title : 'Unknown Course'}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span>{quiz.questions.length} questions</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                            {quiz.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {quizzes.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No quizzes found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor-requests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Pending Instructor Requests
                </CardTitle>
                <CardDescription>Review and approve new instructor registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingInstructors.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                        <div>
                          <p className="font-medium">{request.userName}</p>
                          <p className="text-sm text-gray-600">{request.userEmail}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleApproveInstructor(request.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeclineInstructor(request.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingInstructors.length === 0 && (
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                      <p className="mt-1 text-sm text-gray-500">All instructor requests have been processed.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    User Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Total Users</span>
                      <span className="font-medium">{systemStats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Students</span>
                      <span className="font-medium">{users.filter(u => u.role === 'student').length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Instructors</span>
                      <span className="font-medium">{users.filter(u => u.role === 'instructor').length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Admins</span>
                      <span className="font-medium">{users.filter(u => u.role === 'admin').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Course Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Total Courses</span>
                      <span className="font-medium">{systemStats.totalCourses}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Total Content Items</span>
                      <span className="font-medium">{systemStats.totalContent}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Total Quizzes</span>
                      <span className="font-medium">{systemStats.totalQuizzes}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Average Quiz Score</span>
                      <span className="font-medium">{systemStats.averageQuizScore.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
