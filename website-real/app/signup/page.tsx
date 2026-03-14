import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Sign up',
};

export default function SignUpPage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Sign up is disabled</h1>
        <p className="mt-3 text-gray-600">This survey project does not use account creation.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-lg bg-black px-5 py-2.5 text-white">
          Continue to Shop
        </Link>
      </div>
    </main>
  );
}
