'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function CreateAccountContent() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    
    // Redirect to success page with session_id if available
    if (sid) {
      router.push(`/success?session_id=${sid}`);
    } else {
      router.push('/success');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fbf6f0] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

export default function CreateAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fbf6f0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    }>
      <CreateAccountContent />
    </Suspense>
  );
}