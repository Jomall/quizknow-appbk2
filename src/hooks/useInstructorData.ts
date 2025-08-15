import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storage } from '@/lib/data/storage';
import { User, Course } from '@/lib/types';

// Query keys
export const instructorKeys = {
  all: ['instructor'] as const,
  courses: (instructorId: string) => [...instructorKeys.all, 'courses', instructorId] as const,
  requests: (instructorId: string) => [...instructorKeys.all, 'requests', instructorId] as const,
  students: (instructorId: string) => [...instructorKeys.all, 'students', instructorId] as const,
};

interface StudentRequest {
  student: User;
  course: Course;
  requestDate: Date;
  status: 'pending' | 'approved' | 'declined';
}

// Custom hook for instructor courses
export function useInstructorCourses(instructorId: string) {
  return useQuery({
    queryKey: instructorKeys.courses(instructorId),
    queryFn: () => storage.getCourses().filter(c => c.instructorId === instructorId),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

// Custom hook for student requests
export function useStudentRequests(instructorId: string) {
  return useQuery({
    queryKey: instructorKeys.requests(instructorId),
    queryFn: async (): Promise<StudentRequest[]> => {
      const courses = storage.getCourses().filter(c => c.instructorId === instructorId);
      const studentRequests: StudentRequest[] = [];
      
      courses.forEach(course => {
        const students = storage.getStudentsForCourse(course.id);
        
        students.pending.forEach(student => {
          studentRequests.push({
            student,
            course,
            requestDate: new Date(),
            status: 'pending'
          });
        });
        
        students.enrolled.forEach(student => {
          studentRequests.push({
            student,
            course,
            requestDate: new Date(),
            status: 'approved'
          });
        });
      });
      
      return studentRequests;
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
}

// Mutation for approving students
export function useApproveStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ studentId, courseId }: { studentId: string; courseId: string }) => {
      return new Promise<void>((resolve) => {
        storage.approvePendingStudent(studentId, courseId);
        resolve();
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: instructorKeys.requests(variables.studentId) 
      });
    },
  });
}

// Mutation for declining students
export function useDeclineStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ studentId, courseId }: { studentId: string; courseId: string }) => {
      return new Promise<void>((resolve) => {
        storage.removePendingStudent(studentId, courseId);
        resolve();
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: instructorKeys.requests(variables.studentId) 
      });
    },
  });
}

// Optimistic bulk operations
export function useBulkApproveStudents() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requests: Array<{ studentId: string; courseId: string }>) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      requests.forEach(({ studentId, courseId }) => {
        storage.approvePendingStudent(studentId, courseId);
      });
    },
    onMutate: async (requests) => {
      await queryClient.cancelQueries({ queryKey: instructorKeys.all });
      const previousRequests = queryClient.getQueryData(instructorKeys.all);
      
      queryClient.setQueryData(instructorKeys.all, (old: any) => {
        return old?.map((req: any) => {
          const shouldUpdate = requests.some(
            r => r.studentId === req.student.id && r.courseId === req.course.id
          );
          return shouldUpdate ? { ...req, status: 'approved' } : req;
        });
      });
      
      return { previousRequests };
    },
    onError: (err: Error, variables: any, context: any) => {
      queryClient.setQueryData(instructorKeys.all, context?.previousRequests);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.all });
    },
  });
}
