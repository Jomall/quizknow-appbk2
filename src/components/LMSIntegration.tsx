'use client';

import { useState, useEffect } from 'react';
import DashboardMetrics from './DashboardMetrics';
import { 
  User, 
  StudentRequest, 
  getStudentRequests, 
  submitStudentRequest, 
  acceptStudentRequest, 
  rejectStudentRequest,
  getInstructorStudents,
  getStudentInstructors,
  assignContent,
  getAssignedContent,
  completeContentAssignment
} from '@/lib/lms-integration';

interface LMSIntegrationProps {
  currentUser: User;
}

export default function LMSIntegration({ currentUser }: LMSIntegrationProps) {
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]);
  const [instructorStudents, setInstructorStudents] = useState<User[]>([]);
  const [studentInstructors, setStudentInstructors] = useState<User[]>([]);
  const [assignedContent, setAssignedContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (currentUser.role === 'instructor') {
        const requests = await getStudentRequests(currentUser.id);
        const students = await getInstructorStudents(currentUser.id);
        setStudentRequests(requests);
        setInstructorStudents(students);
      } else if (currentUser.role === 'student') {
        const instructors = await getStudentInstructors(currentUser.id);
        const assignments = await getAssignedContent(currentUser.id);
        setStudentInstructors(instructors);
        setAssignedContent(assignments);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (instructorId: number) => {
    if (!requestMessage.trim()) return;
    
    const success = await submitStudentRequest(
      currentUser.id,
      instructorId,
      requestMessage
    );
    
    if (success) {
      setRequestMessage('');
      loadData();
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    const success = await acceptStudentRequest(requestId);
    if (success) loadData();
  };

  const handleRejectRequest = async (requestId: number) => {
    const success = await rejectStudentRequest(requestId);
    if (success) loadData();
  };

  const handleAssignContent = async (studentId: number, contentType: string, contentId: number) => {
    const success = await assignContent(
      currentUser.id,
      studentId,
      contentType,
      contentId
    );
    if (success) loadData();
  };

  const handleCompleteAssignment = async (assignmentId: number) => {
    const success = await completeContentAssignment(assignmentId);
    if (success) loadData();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">LMS Integration Dashboard</h1>
      
      <DashboardMetrics currentUser={currentUser} />
      
      {currentUser.role === 'instructor' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Student Requests</h2>
            {studentRequests.length === 0 ? (
              <p className="text-gray-500">No pending requests</p>
            ) : (
              <div className="space-y-4">
                {studentRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{request.student_name}</h3>
                        <p className="text-sm text-gray-600">{request.student_email}</p>
                        <p className="mt-2">{request.request_message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Students</h2>
            {instructorStudents.length === 0 ? (
              <p className="text-gray-500">No students connected yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {instructorStudents.map((student) => (
                  <div key={student.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {currentUser.role === 'student' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Instructors</h2>
            {studentInstructors.length === 0 ? (
              <p className="text-gray-500">No instructors connected yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentInstructors.map((instructor) => (
                  <div key={instructor.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold">{instructor.name}</h3>
                    <p className="text-sm text-gray-600">{instructor.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Assigned Content</h2>
            {assignedContent.length === 0 ? (
              <p className="text-gray-500">No content assigned yet</p>
            ) : (
              <div className="space-y-4">
                {assignedContent.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          {assignment.content_type} #{assignment.content_id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Assigned by: {assignment.instructor_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        {assignment.status === 'assigned' && (
                          <button
                            onClick={() => handleCompleteAssignment(assignment.id)}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                          >
                            Mark Complete
                          </button>
                        )}
                        {assignment.status === 'completed' && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
