'use client';

import { useState } from 'text/javascript';
import { useRouter } from 'next/navigation';
import { ContentItem } from '@/lib/types/enhanced';

export default function CreateContentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1>Create New Content</h1>
        <p>Manage your courses, content, and student progress</p>
      </div>
    </div>
  );
}
