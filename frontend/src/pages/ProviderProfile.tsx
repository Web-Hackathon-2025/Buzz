import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, DollarSign, Shield, 
  Calendar, Clock, CheckCircle, ArrowLeft,
  Phone, Mail, MessageSquare
} from 'lucide-react';
import { api } from '../utils/api';
import Layout from '../components/Layout';

interface Availability {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer_name: string;
}

interface ProviderProfile {
  id: string;
  user_id: string;
  category_id: number | null;
  category_name: string | null;
  bio: string | null;
  base_price: number | null;
  is_verified: boolean;
  avg_rating: number;
  provider_name: string | null;
  provider_email: string | null;
  provider_phone: string | null;
  availability: Availability[];
  reviews: Review[];
}

const ProviderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadProviderProfile();
    }
  }, [id]);

  const loadProviderProfile = async () => {
    try {
      const data = await api.getProviderProfile(id!);
      setProvider(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load provider profile');
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            <p className="mt-4 text-stone-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !provider) {
    return (
      <Layout>
        <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Provider not found'}</p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
            >
              Back to Search
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 text-stone-600 hover:text-amber-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Search
          </button>

          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-stone-200">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-stone-900">
                        {provider.provider_name || 'Service Provider'}
                      </h1>
                      {provider.is_verified && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                          <Shield size={14} />
                          Verified
                        </div>
                      )}
                    </div>
                    <p className="text-stone-600 text-lg">{provider.category_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="text-amber-500 fill-amber-500" size={24} />
                    <span className="text-2xl font-bold text-stone-900">
                      {provider.avg_rating.toFixed(1)}
                    </span>
                    <span className="text-stone-600">({provider.reviews.length} reviews)</span>
                  </div>
                  {provider.base_price && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-amber-700" size={24} />
                      <span className="text-2xl font-bold text-stone-900">
                        ₹{provider.base_price}
                      </span>
                      <span className="text-stone-600">/service</span>
                    </div>
                  )}
                </div>

                {provider.bio && (
                  <p className="text-stone-700 leading-relaxed mb-6">{provider.bio}</p>
                )}

                <div className="flex flex-wrap gap-4">
                  {provider.provider_phone && (
                    <div className="flex items-center gap-2 text-stone-600">
                      <Phone size={18} />
                      <span>{provider.provider_phone}</span>
                    </div>
                  )}
                  {provider.provider_email && (
                    <div className="flex items-center gap-2 text-stone-600">
                      <Mail size={18} />
                      <span>{provider.provider_email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:w-64">
                <button
                  onClick={() => navigate(`/book/${provider.id}`)}
                  className="w-full bg-gradient-to-r from-amber-700 to-orange-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all mb-4 flex items-center justify-center gap-2"
                >
                  <Calendar size={20} />
                  Book Service
                </button>
                <button className="w-full bg-stone-100 text-stone-700 py-3 rounded-xl font-medium hover:bg-stone-200 transition-colors flex items-center justify-center gap-2">
                  <MessageSquare size={18} />
                  Contact Provider
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Availability */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-stone-200">
              <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Clock className="text-amber-700" size={24} />
                Availability
              </h2>
              {provider.availability.length > 0 ? (
                <div className="space-y-3">
                  {provider.availability.map((avail, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                      <span className="font-medium text-stone-900">
                        {daysOfWeek[avail.day_of_week]}
                      </span>
                      <span className="text-stone-600">
                        {avail.start_time} - {avail.end_time}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-600">Availability information not available</p>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-stone-200">
              <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Star className="text-amber-700" size={24} />
                Reviews ({provider.reviews.length})
              </h2>
              {provider.reviews.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {provider.reviews.map((review) => (
                    <div key={review.id} className="border-b border-stone-200 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`${
                                  i < review.rating
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-stone-300'
                                }`}
                                size={16}
                              />
                            ))}
                          </div>
                          <span className="font-semibold text-stone-900">
                            {review.customer_name}
                          </span>
                        </div>
                        <span className="text-stone-500 text-sm">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-stone-700 text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-600">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProviderProfile;

