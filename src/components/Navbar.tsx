import Link from 'next/link';
import { FC } from 'react';

const Navbar: FC = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li>
          <Link href="/" className="text-white">Home</Link>
        </li>
        <li>
          <Link href="/login" className="text-white">Login</Link>
        </li>
        <li>
          <Link href="/forgot-password" className="text-white">Forgot Password</Link>
        </li>
        <li>
          <Link href="/register" className="text-white">Register</Link>
        </li>
        <li>
          <Link href="/admin" className="text-white">Admin</Link>
        </li>
        <li>
          <Link href="/instructor" className="text-white">Instructor</Link>
        </li>
        <li>
          <Link href="/student" className="text-white">Student</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
