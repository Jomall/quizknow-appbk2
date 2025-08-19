# Demo Accounts - Instructor Approval System

## 🎯 **Demo Accounts for Testing**

### **Instructor Accounts (Pending Approval)**
| Email | Password | Status | Notes |
|-------|----------|--------|-------|
| `instructor1@demo.com` | `DemoPass123!` | Pending Approval | New instructor registration |
| `instructor2@demo.com` | `DemoPass123!` | Pending Approval | New instructor registration |
| `pending@lms.com` | `DemoPass123!` | Pending Approval | Standard test account |

### **Instructor Accounts (Approved)**
| Email | Password | Status | Notes |
|-------|----------|--------|-------|
| `approved@lms.com` | `DemoPass123!` | Approved | Active instructor account |
| `teacher@demo.com` | `DemoPass123!` | Approved | Active instructor account |

### **Admin Accounts (For Approval Management)**
| Email | Password | Role | Notes |
|-------|----------|------|-------|
| `admin@lms.com` | `AdminPass123!` | Super Admin | Full system access |
| `manager@lms.com` | `AdminPass123!` | Admin Manager | Can approve instructors |

### **Student Accounts (For Testing)**
| Email | Password | Role | Notes |
|-------|----------|------|-------|
| `student1@demo.com` | `Student123!` | Student | Regular student account |
| `student2@demo.com` | `Student123!` | Student | Regular student account |

## 🔧 **Quick Start Commands**

```bash
# Start the development server
npm run dev

# Access the system:
# 1. Instructor pending approval: http://localhost:3000/instructor/pending-approval
# 2. Admin approval dashboard: http://localhost:3000/admin/instructor-approvals
```

## 📋 **Testing Scenarios**

### **Scenario 1: New Instructor Registration**
1. Login with `instructor1@demo.com` / `DemoPass123!`
2. View pending approval status
3. Check email notifications

### **Scenario 2: Admin Approval Process**
1. Login with `admin@lms.com` / `AdminPass123!`
2. Navigate to admin dashboard
3. Review pending instructor applications
4. Approve or reject applications

### **Scenario 3: Status Checking**
1. Use API endpoint: `GET http://localhost:3000/api/instructor/approval-status?email=instructor1@demo.com`
2. Expected response: `{"email":"instructor1@demo.com","status":"pending","message":"Your application is under review"}`

## 🚨 **Important Notes**
- All passwords are case-sensitive
- Demo accounts reset every 24 hours
- Mock email notifications are logged to console
- Database is pre-populated with test data
