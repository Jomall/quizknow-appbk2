'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, Mail, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PendingApprovalPage() {
  const router = useRouter();
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [estimatedTime, setEstimatedTime] = useState('24-48 hours');
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    // Check approval status periodically
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/instructor/approval-status');
        const data = await response.json();
        
        if (data.status === 'approved') {
          router.push('/instructor/dashboard');
        } else if (data.status === 'rejected') {
          setApprovalStatus('rejected');
        }
      } catch (error) {
        console.error('Error checking approval status:', error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [router]);

  const handleContactAdmin = () => {
    window.location.href = 'mailto:admin@lms.com?subject=Instructor Account Approval Request';
  };

  const handleResendRequest = async () => {
    try {
      await fetch('/api/instructor/resend-approval', { method: 'POST' });
      alert('Approval request resent successfully!');
    } catch (error) {
      console.error('Error resending request:', error);
    }
  };

  if (approvalStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Account Not Approved</CardTitle>
            <CardDescription>
              Your instructor account application has been reviewed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Unfortunately, your instructor account application was not approved at this time. 
                Please contact the administrator for more information.
              </AlertDescription>
            </Alert>
            <Button onClick={handleContactAdmin} className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Contact Administrator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <CardTitle>Account Pending Approval</CardTitle>
          <CardDescription>
            Your instructor account is being reviewed by our team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your application has been submitted successfully and is under review.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <h3 className="font-semibold">What happens next?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Our team will review your application within {estimatedTime}</li>
              <li>• You'll receive an email notification once approved</li>
              <li>• You can start creating courses immediately after approval</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleResendRequest} 
              variant="outline" 
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Resend Approval Request
            </Button>
            
            <Button 
              onClick={handleContactAdmin} 
              variant="secondary" 
              className="w-full"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Administrator
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
