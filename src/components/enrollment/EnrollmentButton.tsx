import React from 'react';
import { useEnrollmentManagement } from '@/hooks/useEnrollmentManagement';
import { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface EnrollmentButtonProps {
  course: Course;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const EnrollmentButton: React.FC<EnrollmentButtonProps> = ({
  course,
  onSuccess,
  onError,
}) => {
  const { requestEnrollment, getEnrollmentStatus, loading } = useEnrollmentManagement();
  
  const enrollmentStatus = getEnrollmentStatus('current-user', course.id);
  const isEnrolled = course.enrolledStudents.includes('current-user');

  const handleEnrollmentRequest = async () => {
    const success = await requestEnrollment(course);
    if (success) {
      onSuccess?.();
    } else {
      onError?.('Failed to request enrollment');
    }
  };

  if (isEnrolled) {
    return (
      <Button disabled className="w-full">
        Already Enrolled
      </Button>
    );
  }

  if (enrollmentStatus === 'pending') {
    return (
      <Button disabled variant="outline" className="w-full">
        Enrollment Pending
      </Button>
    );
  }

  if (enrollmentStatus === 'approved') {
    return (
      <Button disabled className="w-full bg-green-600">
        Enrollment Approved
      </Button>
    );
  }

  if (enrollmentStatus === 'declined') {
    return (
      <Button disabled variant="destructive" className="w-full">
        Enrollment Declined
      </Button>
    );
  }

  return (
    <Button
      onClick={handleEnrollmentRequest}
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Request Enrollment'
      )}
    </Button>
  );
};
