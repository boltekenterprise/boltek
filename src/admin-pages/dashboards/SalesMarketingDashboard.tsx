import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { AlertCircle, MessageSquare, Loader } from 'lucide-react';

interface Review {
  author: string;
  rating: number;
  review_text: string;
}

export default function SalesMarketingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'google_reviews'), orderBy('review_datetime', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(docSnap => docSnap.data() as Review);
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-black text-3xl text-gray-900">Sales & Marketing</h1>
        <p className="text-gray-600 mt-1">Manage marketing, leads, campaigns, and sales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <h3 className="font-heading font-bold text-amber-900 mb-2">Active Leads</h3>
          <p className="font-heading font-black text-3xl text-amber-900">0</p>
          <p className="text-sm text-amber-700 mt-2">To follow up</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <h3 className="font-heading font-bold text-orange-900 mb-2">Marketing Posts</h3>
          <p className="font-heading font-black text-3xl text-orange-900">0</p>
          <p className="text-sm text-orange-700 mt-2">Published</p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
          <h3 className="font-heading font-bold text-pink-900 mb-2">Google Reviews</h3>
          <p className="font-heading font-black text-3xl text-pink-900">
            {reviews.length > 0 ? reviews[0]?.rating || '★' : '★'}
          </p>
          <p className="text-sm text-pink-700 mt-2">Latest rating</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-6 border border-rose-200">
          <h3 className="font-heading font-bold text-rose-900 mb-2">Conversion Rate</h3>
          <p className="font-heading font-black text-3xl text-rose-900">0%</p>
          <p className="text-sm text-rose-700 mt-2">This month</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['overview', 'leads', 'marketing', 'reviews'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-flame-700 text-white'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        {activeTab === 'overview' && (
          <div>
            <h2 className="font-heading font-bold text-xl mb-4">Sales Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-amber-600 mb-1 font-semibold">Cold Calls This Week</p>
                <p className="font-heading font-black text-2xl text-amber-900">0</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-600 mb-1 font-semibold">Conversions</p>
                <p className="font-heading font-black text-2xl text-orange-900">0</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div>
            <h2 className="font-heading font-bold text-xl mb-4">Sales Leads</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">Create and manage sales leads from cold calls and referrals</p>
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div>
            <h2 className="font-heading font-bold text-xl mb-4">Marketing Campaigns</h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-orange-800">Manage social media posts, content, and marketing strategies</p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h2 className="font-heading font-bold text-xl mb-4">Google Reviews</h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-5 h-5 text-flame-700 animate-spin mr-2" />
                <span className="text-gray-600 text-sm">Loading reviews...</span>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((review, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900">{review.author}</p>
                      <span className="text-sm font-medium text-amber-600">
                        {'★'.repeat(review.rating)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{review.review_text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-pink-600" />
                <p className="text-sm text-pink-800">No Google Reviews yet. Reviews will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
