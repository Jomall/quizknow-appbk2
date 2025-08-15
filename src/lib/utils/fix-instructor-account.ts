import { storage } from '@/lib/data/storage';
import { InstructorApprovalStorage } from '@/lib/data/instructor-approval-storage';
import { User } from '@/lib/types';

export function fixInstructorAccount(email: string, name: string) {
  try {
    const users = storage.getUsers();
    
    // Check if user exists
    let instructorUser = users.find(u => u.email === email);
    
    if (!instructorUser) {
      // Create new instructor account
      instructorUser = {
        id: Date.now().toString(),
        email,
        name,
        role: 'instructor',
        phone: '000-000-0000',
        enrolledCourses: [],
        createdCourses: [],
        createdAt: new Date(),
        isApproved: true, // Auto-approve for jomalljack@hotmail.com
      };
      
      users.push(instructorUser);
      storage.saveUsers(users);
      console.log(`✅ Created instructor account for ${email}`);
    } else {
      // Update existing account
      instructorUser.role = 'instructor';
      instructorUser.isApproved = true;
      instructorUser.name = name || instructorUser.name;
      storage.saveUsers(users);
      console.log(`✅ Updated instructor account for ${email}`);
    }
    
    // Create approval record if needed
    const approvalRequests = InstructorApprovalStorage.getAllRequests();
    const existingRequest = approvalRequests.find(r => r.userId === instructorUser.id);
    
    if (!existingRequest) {
      InstructorApprovalStorage.createRequest(
        instructorUser.id,
        instructorUser.name,
        instructorUser.email,
        'Auto-approved instructor account'
      );
      console.log(`✅ Created approval record for ${email}`);
    }
    
    return {
      success: true,
      message: `Instructor account for ${email} has been fixed and approved`,
      user: instructorUser
    };
    
  } catch (error) {
    console.error('Error fixing instructor account:', error);
    return {
      success: false,
      message: 'Failed to fix instructor account',
      error
    };
  }
}

// Usage example
// fixInstructorAccount('jomalljack@hotmail.com', 'Instructor Jomall Jack');
