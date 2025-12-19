import { useState, useEffect } from 'react';
import { 
  UserCheck, Shield, CheckCircle, XCircle,
  Search, Star, DollarSign, AlertCircle
} from 'lucide-react';
import { api } from '../utils/api';
import Layout from '../components/Layout';

interface Provider {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  category_name: string;
  bio: string;
  base_price: number;
  is_verified: boolean;
  avg_rating: number;
  created_at: string;
}

const AdminProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');

  useEffect(() => {
    loadProviders();
  }, [filter]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      if (filter === 'pending') {
        const data = await api.getPendingProviders();
        setProviders(data || []);
      } else {
        // For all/verified, we'd need a different endpoint or filter client-side
        const data = await api.getPendingProviders();
        setProviders(data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (providerId: string, isVerified: boolean) => {
    try {
      await api.verifyProvider(providerId, isVerified);
      loadProviders();
    } catch (err: any) {
      alert(err.message || 'Failed to update verification status');
    }
  };

  if (loading && providers.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            <p className="mt-4 text-stone-600">Loading providers...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50">
        {/* Header */}
        <div className="bg-white border-b border-amber-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-800 via-orange-800 to-amber-900 bg-clip-text text-transparent">
                  Provider Management
                </h1>
                <p className="text-stone-600 mt-2">Verify and manage service providers</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-6 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-amber-700 to-orange-700 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All Providers
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-gradient-to-r from-amber-700 to-orange-700 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Pending Verification
              </button>
              <button
                onClick={() => setFilter('verified')}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  filter === 'verified'
                    ? 'bg-gradient-to-r from-amber-700 to-orange-700 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Verified
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Providers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-2xl shadow-lg border border-stone-100 p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-stone-900">{provider.full_name}</h3>
                      {provider.is_verified && (
                        <Shield className="text-amber-600" size={20} />
                      )}
                    </div>
                    <p className="text-stone-600 text-sm mb-2">{provider.email}</p>
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                      {provider.category_name || 'Uncategorized'}
                    </span>
                  </div>
                </div>

                {provider.bio && (
                  <p className="text-stone-600 text-sm mb-4 line-clamp-2">{provider.bio}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="text-amber-500 fill-amber-500" size={16} />
                    <span className="text-stone-700 font-semibold">
                      {provider.avg_rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div className="text-stone-600">
                    <DollarSign className="inline" size={16} />
                    <span className="font-semibold">{provider.base_price || '0'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!provider.is_verified ? (
                    <button
                      onClick={() => handleVerify(provider.id, true)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Verify
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerify(provider.id, false)}
                      className="flex-1 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Unverify
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {providers.length === 0 && !loading && (
            <div className="text-center py-12">
              <UserCheck className="mx-auto text-stone-400 mb-4" size={48} />
              <p className="text-stone-600">No providers found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminProviders;

