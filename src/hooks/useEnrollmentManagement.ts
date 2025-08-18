import { useState, useEffect, useCallback } from 'react';
import { EnrollmentRequest, EnrollmentSettings } from '@/lib/types/enrollment';
import { enrollmentStorage } from '@/lib/data/enrollment-storage';
import { Course } from '@/lib/types';
import { useAuth } from './useAuth';

export const useEnrollmentManagement = () => {
  const { user } = useAuth();
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([]);
  const [enrollmentSettings, setEnrollmentSettings] = useState<EnrollmentSettings[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load enrollment data
  const loadEnrollmentData = useCallback(() => {
    try {
      setLoading(true);
      const requests = enrollmentStorage.getEnrollmentRequests();
      const settings = enrollmentStorage.getEnrollmentSettings();
      
      setEnrollmentRequests(requests);
      setEnrollmentSettings(settings);
      setError(null);
    } catch (err) {
      setError('Failed to load enrollment data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnrollmentData();
  }, [loadEnrollmentData]);

  // Student actions
  const requestEnrollment = useCallback(async (
    course: Course,
    message?: string
  ): Promise<boolean> => {
    if (!user || user.role !== 'student') {
      setError('Only students can request enrollment');
      return false;
    }

    try {
      const existingRequest = enrollmentRequests.find(
        r => r.studentId === user.id && r.courseId === course.id
      );

      if (existingRequest) {
        setError('You have already requested enrollment for this course');
        return false;
      }

      const newRequest: EnrollmentRequest = {
        id: enrollmentStorage.generateEnrollmentId(),
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        courseId: course.id,
        courseTitle: course.title,
        instructorId: course.instructorId,
        message,
        status: 'pending',
        createdAt: new Date(),
      };

      enrollmentStorage.addEnrollmentRequest(newRequest);
      setEnrollmentRequests(prev => [...prev, newRequest]);
      
      // Add to history
      enrollmentStorage.addEnrollmentHistory({
        id: enrollmentStorage.generateEnrollmentId(),
        studentId: user.id,
        courseId: course.id,
        action: 'enrolled',
        timestamp: new Date(),
        performedBy: user.id,
      });

      return true;
    } catch (err) {
      setError('Failed to request enrollment');
      return false;
    }
  }, [user, enrollmentRequests]);

  // Instructor actions
  const approveEnrollment = useCallback(async (
    requestId: string
  ): Promise<boolean> => {
    if (!user || user.role !== 'instructor') {
      setError('Only instructors can approve enrollments');
      return false;
    }

    try {
      const request = enrollmentRequests.find(r => r.id === requestId);
      if (!request) {
        setError('Enrollment request not found');
        return false;
      }

      enrollmentStorage.updateEnrollmentRequest(requestId, {
        status: 'approved',
        respondedAt: new Date(),
        respondedBy: user.id,
      });

      setEnrollmentRequests(prev =>
        prev.map(r => r.id === requestId ? { ...r, status: 'approved', respondedAt: new Date() } : r)
      );

      // Add to history
      enrollmentStorage.addEnrollmentHistory({
        id: enrollmentStorage.generateEnrollmentId(),
        studentId: request.studentId,
        courseId: request.courseId,
        action: 'approved',
        timestamp: new Date(),
        performedBy: user.id,
      });

      return true;
    } catch (err) {
      setError('Failed to approve enrollment');
      return false;
    }
  }, [user, enrollmentRequests]);

  const declineEnrollment = useCallback(async (
    requestId: string,
    reason?: string
  ): Promise<boolean> => {
    if (!user || user.role !== 'instructor') {
      setError('Only instructors can decline enrollments');
      return false;
    }

    try {
      const request = enrollmentRequests.find(r => r.id === requestId);
      if (!request) {
        setError('Enrollment request not found');
        return false;
      }

      enrollmentStorage.updateEnrollmentRequest(requestId, {
        status: 'declined',
        respondedAt: new Date(),
        respondedBy: user.id,
      });

      setEnrollmentRequests(prev =>
        prev.map(r => r.id === requestId ? { ...r, status: 'declined', respondedAt: new Date() } : r)
      );

      // Add to history
      enrollmentStorage.addEnrollmentHistory({
        id: enrollmentStorage.generateEnrollmentId(),
        studentId: request.studentId,
        courseId: request.courseId,
        action: 'declined',
        timestamp: new Date(),
        performedBy: user.id,
      });

      return true;
    } catch (err) {
      setError('Failed to decline enrollment');
      return false;
    }
  }, [user, enrollmentRequests]);

  // Getters
  const getPendingRequests = useCallback((instructorId: string) => {
    return enrollmentRequests.filter(r => r.instructorId === instructorId && r.status === 'pending');
  }, [enrollmentRequests]);

  const getStudentRequests = useCallback((studentId: string) => {
    return enrollmentRequests.filter(r => r.studentId === studentId);
  }, [enrollmentRequests]);

  const getEnrollmentStatus = useCallback((studentId: string, courseId: string) => {
    const request = enrollmentRequests.find(
      r => r.studentId === studentId && r.courseId === courseId
    );
    return request?.status || null;
  }, [enrollmentRequests]);

  const getCourseEnrollmentSettings = useCallback((courseId: string) => {
    return enrollmentSettings.find(s => s.courseId === courseId);
  }, [enrollmentSettings]);

  return {
    enrollmentRequests,
    enrollmentSettings,
    loading,
    error,
    requestEnrollment,
    approveEnrollment,
    declineEnrollment,
    getPendingRequests,
    getStudentRequests,
    getEnrollmentStatus,
    getCourseEnrollmentSettings,
    refresh: loadEnrollmentData,
  };
};
