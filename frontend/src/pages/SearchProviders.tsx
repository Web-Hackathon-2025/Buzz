import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Star, DollarSign, 
  Shield, Filter, SlidersHorizontal, 
  ChevronRight, Navigation
} from 'lucide-react';
import { api } from '../utils/api';
import Layout from '../components/Layout';

interface Provider {
  id: string;
  user_id: string;
  category_id: number | null;
  category_name: string | null;
  bio: string | null;
  base_price: number | null;
  is_verified: boolean;
  avg_rating: number;
  distance_km: number | null;
  provider_name: string | null;
  provider_email: string | null;
}

interface Category {
  id: number;
  name: string;
  icon_url: string | null;
}

const SearchProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [searchParams, setSearchParams] = useState({
    service: '',
    location: '',
    latitude: 0,
    longitude: 0,
    category_id: undefined as number | undefined,
    min_rating: undefined as number | undefined,
    max_price: undefined as number | undefined,
    min_price: undefined as number | undefined,
    radius_km: 10,
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSearchParams(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        () => {
          // Default to a location if geolocation fails
          setSearchParams(prev => ({
            ...prev,
            latitude: 28.6139,
            longitude: 77.2090,
          }));
        }
      );
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchParams.latitude || !searchParams.longitude) {
      setError('Please allow location access or enter a location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.searchProviders({
        latitude: searchParams.latitude,
        longitude: searchParams.longitude,
        category_id: searchParams.category_id,
        min_rating: searchParams.min_rating,
        max_price: searchParams.max_price,
        min_price: searchParams.min_price,
        radius_km: searchParams.radius_km,
        limit: 20,
        offset: 0,
      });
      setProviders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search providers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-stone-900 mb-2">Find Service Providers</h1>
            <p className="text-stone-600">Discover trusted professionals near you</p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-stone-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500">
                <Search className="text-stone-400" size={20} />
                <input
                  type="text"
                  value={searchParams.service}
                  onChange={(e) => setSearchParams({ ...searchParams, service: e.target.value })}
                  placeholder="What service do you need?"
                  className="flex-1 border-none outline-none bg-transparent text-stone-700 placeholder-stone-400"
                />
              </div>
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500">
                <MapPin className="text-stone-400" size={20} />
                <input
                  type="text"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                  placeholder="Location"
                  className="flex-1 border-none outline-none bg-transparent text-stone-700 placeholder-stone-400"
                />
                <button
                  onClick={getCurrentLocation}
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Use current location"
                >
                  <Navigation size={18} className="text-amber-700" />
                </button>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 transition-colors flex items-center gap-2"
              >
                <SlidersHorizontal size={20} />
                Filters
              </button>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Search size={20} />
                Search
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-stone-200 grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Category</label>
                  <select
                    value={searchParams.category_id || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, category_id: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Min Rating</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={searchParams.min_rating || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, min_rating: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Min Price</label>
                  <input
                    type="number"
                    value={searchParams.min_price || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, min_price: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="₹0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Max Price</label>
                  <input
                    type="number"
                    value={searchParams.max_price || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, max_price: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="₹10000"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
              <p className="mt-4 text-stone-600">Searching providers...</p>
            </div>
          ) : providers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  onClick={() => navigate(`/provider/${provider.id}`)}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-stone-200 hover:border-amber-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-stone-900 mb-1">
                        {provider.provider_name || 'Service Provider'}
                      </h3>
                      <p className="text-stone-600 text-sm">{provider.category_name}</p>
                    </div>
                    {provider.is_verified && (
                      <div className="flex items-center gap-1 text-amber-700">
                        <Shield size={18} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="text-amber-500 fill-amber-500" size={18} />
                      <span className="font-semibold text-stone-900">{provider.avg_rating.toFixed(1)}</span>
                    </div>
                    {provider.distance_km && (
                      <div className="flex items-center gap-1 text-stone-600">
                        <MapPin size={16} />
                        <span className="text-sm">{provider.distance_km.toFixed(1)} km away</span>
                      </div>
                    )}
                  </div>

                  {provider.bio && (
                    <p className="text-stone-600 text-sm mb-4 line-clamp-2">{provider.bio}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                    {provider.base_price && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="text-amber-700" size={18} />
                        <span className="font-bold text-stone-900">₹{provider.base_price}</span>
                        <span className="text-stone-600 text-sm">/service</span>
                      </div>
                    )}
                    <ChevronRight className="text-amber-700" size={20} />
                  </div>
                </div>
              ))}
            </div>
          ) : providers.length === 0 && !loading ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
              <Search className="mx-auto text-stone-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-stone-900 mb-2">No providers found</h3>
              <p className="text-stone-600">Try adjusting your search criteria</p>
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
};

export default SearchProviders;

