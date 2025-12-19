import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, MessageSquare, Calendar, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';
import Layout from '../components/Layout';

interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_name: string | null;
}

const CreateReview = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.createReview({
        booking_id: bookingId!,
        rating,
        comment: comment || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/reviews');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create review');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md border border-stone-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Review Submitted!</h2>
            <p className="text-stone-600">Thank you for your feedback.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stone-600 hover:text-amber-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-stone-200">
            <h1 className="text-3xl font-bold text-stone-900 mb-2">Write a Review</h1>
            <p className="text-stone-600 mb-8">Share your experience with this service provider</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-4">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`${
                          star <= (hoverRating || rating)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300'
                        } transition-colors`}
                        size={40}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="mt-2 text-sm text-stone-600">
                    {rating === 5 && 'Excellent'}
                    {rating === 4 && 'Very Good'}
                    {rating === 3 && 'Good'}
                    {rating === 2 && 'Fair'}
                    {rating === 1 && 'Poor'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  <MessageSquare className="inline mr-2" size={18} />
                  Your Review (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={6}
                  placeholder="Tell others about your experience..."
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-200">
                <button
                  type="submit"
                  disabled={loading || rating === 0}
                  className="w-full bg-gradient-to-r from-amber-700 to-orange-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const MyReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await api.getMyReviews();
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-stone-900 mb-2">My Reviews</h1>
          <p className="text-stone-600 mb-8">Reviews you've written for service providers</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
              <p className="mt-4 text-stone-600">Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-stone-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`${
                              i < review.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-stone-300'
                            }`}
                            size={20}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-stone-900">
                        {review.rating}/5
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-500 text-sm">
                      <Calendar size={16} />
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-stone-700 mb-4">{review.comment}</p>
                  )}

                  <div className="pt-4 border-t border-stone-200">
                    <button
                      onClick={() => navigate(`/provider/${review.provider_id}`)}
                      className="text-amber-700 hover:text-amber-800 font-medium text-sm"
                    >
                      View Provider Profile →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
              <Star className="mx-auto text-stone-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-stone-900 mb-2">No reviews yet</h3>
              <p className="text-stone-600 mb-6">Complete a service to write your first review</p>
              <button
                onClick={() => navigate('/bookings')}
                className="px-6 py-3 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                View Bookings
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export { CreateReview, MyReviews };
export default MyReviews;

