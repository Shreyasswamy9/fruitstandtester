"use client";
import React, { useEffect, useState } from "react";

export interface CustomerReview {
  id: number | string;
  name: string;
  rating: number;
  review: string;
  created_at?: string;
}

interface CustomerReviewsProps {
  // If reviews prop is provided, render those; otherwise fetch by productId
  reviews?: CustomerReview[];
  productId?: string;
}

const CustomerReviews: React.FC<CustomerReviewsProps> = ({ reviews: initialReviews, productId }) => {
  const [reviews, setReviews] = useState<CustomerReview[]>(initialReviews || []);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", rating: 5, review: "" });

  useEffect(() => {
    // If a productId is provided, fetch reviews from the API
    if (!productId) return;
    let mounted = true;
    setLoading(true);
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setReviews(Array.isArray(data.data) ? data.data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setReviews([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    if (!form.name || !form.review) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, name: form.name, rating: form.rating, review: form.review })
      });
      const json = await res.json();
      if (json.data) {
        setReviews(prev => [json.data, ...prev]);
        setForm({ name: '', rating: 5, review: '' });
      } else {
        // ignore error for now
        console.error('Failed to submit review', json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', background: '#fbf6f0' }} className="py-12 px-4">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Customer Reviews</h2>

        {/* Review form */}
        {productId && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="flex-1 border p-2 rounded" />
              <select value={form.rating} onChange={(e) => setForm(f => ({ ...f, rating: Number(e.target.value) }))} className="w-28 border p-2 rounded">
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ★</option>)}
              </select>
            </div>
            <textarea value={form.review} onChange={(e) => setForm(f => ({ ...f, review: e.target.value }))} placeholder="Write a review" className="w-full border p-2 rounded mt-3 min-h-20" />
            <div className="flex justify-end mt-3">
              <button type="submit" className="bg-black text-white px-4 py-2 rounded" disabled={submitting}>{submitting ? 'Posting...' : 'Post Review'}</button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {loading ? <p className="text-center text-gray-500">Loading reviews…</p> : (
            reviews.length === 0 ? <p className="text-center text-gray-500">No reviews yet.</p> : reviews.map((review) => (
              <div key={String(review.id)} className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-700">{review.name.charAt(0)}</div>
                    <div>
                      <h4 className="font-semibold text-lg">{review.name}</h4>
                      <div className="flex items-center gap-1">{[...Array(5)].map((_, index) => (<span key={index} className={`text-lg ${index < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>))}</div>
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm">{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.review}</p>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-8">
          <button className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">View All Reviews</button>
        </div>
      </div>
    </div>
  )
}

export default CustomerReviews;
