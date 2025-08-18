import { useState, useEffect } from 'react';
import { EnhancedInstructorRequest } from '@/lib/types/enhanced-instructor-request';
import { getInstructorConnections } from '@/lib/data/enhanced-instructor-request-storage';

export interface InstructorConnection {
  id: string;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  subject: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  lastActivity?: Date;
}

export const useInstructorConnections = (userId: string) => {
  const [connections, setConnections] = useState<InstructorConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        const requests = await getInstructorConnections(userId);
        
        const mappedConnections: InstructorConnection[] = requests.map(req => ({
          id: req.id,
          instructorId: req.instructorId,
          instructorName: req.instructorName,
          instructorEmail: req.instructorEmail,
          subject: req.subject,
          status: req.status,
          createdAt: new Date(req.createdAt),
          lastActivity: req.lastActivity ? new Date(req.lastActivity) : undefined
        }));

        setConnections(mappedConnections);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch connections');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchConnections();
    }
  }, [userId]);

  const refreshConnections = async () => {
    try {
      setLoading(true);
      const requests = await getInstructorConnections(userId);
      
      const mappedConnections: InstructorConnection[] = requests.map(req => ({
        id: req.id,
        instructorId: req.instructorId,
        instructorName: req.instructorName,
        instructorEmail: req.instructorEmail,
        subject: req.subject,
        status: req.status,
        createdAt: new Date(req.createdAt),
        lastActivity: req.lastActivity ? new Date(req.lastActivity) : undefined
      }));

      setConnections(mappedConnections);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh connections');
    } finally {
      setLoading(false);
    }
  };

  return {
    connections,
    loading,
    error,
    refreshConnections
  };
};
