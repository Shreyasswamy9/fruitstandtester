"use client";

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function ConfirmAccountPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const handleResend = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('success');
        setMessage('Confirmation email resent!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to resend confirmation email.');
      }
    } catch (e) {
      setStatus('error');
      setMessage('Failed to resend confirmation email.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">Confirm your account</h1>
      <p className="mb-4">
        We sent a confirmation link{email ? <> to <b>{email}</b></> : null}.<br />
        Click it to finish creating your account.
      </p>
      <div className="flex flex-col gap-3 mb-4">
        <Link
          href="/signin"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Back to sign in
        </Link>
      </div>
      <button
        onClick={handleResend}
        disabled={status === 'loading' || !email}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {status === 'loading' ? 'Resending...' : 'Resend confirmation email'}
      </button>
      {message && (
        <div className={`mt-3 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
