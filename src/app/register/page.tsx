import { AuthForm } from '@/components/auth/auth-form';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
