import React from 'react';
import { Badge } from '@/components/ui/badge';
import { EnrollmentRequest } from '@/lib/types/enrollment';

interface EnrollmentStatusBadgeProps {
  status: EnrollmentRequest['status'];
}

export const EnrollmentStatusBadge: React.FC<EnrollmentStatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: EnrollmentRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: EnrollmentRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'declined':
        return 'Declined';
      default:
        return status;
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {getStatusText(status)}
    </Badge>
  );
};
