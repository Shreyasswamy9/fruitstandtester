"use client";

import { useEffect, useState } from "react";

interface SignupPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignupPromoModal({ isOpen, onClose }: SignupPromoModalProps) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedWith, setSubmittedWith] = useState<"email" | "phone" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-close modal 3 seconds after successful submission
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  const handleClose = () => {
    setSubmitted(false);
    setSubmittedWith(null);
    setEmail("");
    setPhone("");
    setError(null);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Determine which method they used
    const method = email.trim() ? "email" : phone.trim() ? "phone" : null;
    
    if (!method) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call the newsletter API endpoint
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: method === 'email' ? email.trim() : undefined,
          phone: method === 'phone' ? phone.trim() : undefined,
          signupType: method,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to subscribe');
      }

      // Save to localStorage to prevent showing popup again
      try {
        window.localStorage.setItem("signupPromoSubmitted", "1");
      } catch {
        // no-op
      }

      setSubmittedWith(method);
      setSubmitted(true);
    } catch (err) {
      console.error('Subscription error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to subscribe. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Success message
  if (submitted && submittedWith) {
    return (
      <div
        className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/45 px-4 py-10"
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="relative w-full max-w-[420px] border border-black/40 bg-[#fbf6f0] px-8 py-10 shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-3xl leading-none text-black"
          >
            ×
          </button>

          <div className="text-center space-y-4">
            <div className="text-4xl font-black">✓</div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black">
                Thank You!
              </p>
              <p className="mt-4 text-sm text-black">
                You've signed up for your{" "}
                <span className="font-semibold">15% discount</span>
              </p>
              <p className="mt-3 text-sm text-black">
                {submittedWith === "email"
                  ? "Watch your inbox for exclusive offers and updates via email."
                  : "Look for text messages with exclusive offers and updates."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial form
  return (
    <div
      className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/45 px-4 py-10"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-[420px] border border-black/40 bg-[#fbf6f0] px-8 py-10 shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-3xl leading-none text-black"
        >
          ×
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold tracking-[0.4em] text-black">GET</p>
          <p className="mt-1 text-5xl font-black tracking-[0.08em] text-black">15% OFF</p>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-black">
            BY SIGNING UP FOR
            <br />
            EMAIL OR TEXTS
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-black">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email Address"
              className="w-full border border-black/40 bg-transparent px-4 py-3 text-sm text-black outline-none placeholder:text-black/60"
            />
          </div>

          <div className="flex items-center justify-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-black">OR</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-black">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone Number"
              className="w-full border border-black/40 bg-transparent px-4 py-3 text-sm text-black outline-none placeholder:text-black/60"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={(!email.trim() && !phone.trim()) || isLoading}
            className="mt-2 w-full bg-black py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Subscribing...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
