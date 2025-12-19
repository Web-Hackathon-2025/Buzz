import { useState, useEffect } from 'react';
import { 
  Users, UserCheck, Calendar, DollarSign, 
  TrendingUp, Star, Shield, Package,
  ArrowRight, Clock, Award, AlertCircle
} from 'lucide-react';
import { api } from '../utils/api';
import Layout from '../components/Layout';

interface DashboardStats {
  total_users: number;
  total_customers: number;
  total_providers: number;
  verified_providers: number;
  pending_providers: number;
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  total_categories: number;
  total_reviews: number;
  avg_platform_rating: number;
  recent_users: Array<{
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
  }>;
  recent_bookings: Array<{
    id: string;
    status: string;
    scheduled_for: string;
    total_price: number;
    customer_name: string;
    provider_name: string;
    created_at: string;
  }>;
  top_providers: Array<{
    id: string;
    provider_name: string;
    total_bookings: number;
    total_earnings: number;
    avg_rating: number;
  }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await api.getAdminDashboard();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'from-amber-600 to-orange-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    {
      title: 'Total Providers',
      value: stats?.total_providers || 0,
      icon: UserCheck,
      color: 'from-amber-700 to-yellow-700',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    {
      title: 'Total Bookings',
      value: stats?.total_bookings || 0,
      icon: Calendar,
      color: 'from-amber-800 to-orange-800',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.total_revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-amber-900 to-yellow-900',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      title: 'Pending Providers',
      value: stats?.pending_providers || 0,
      icon: AlertCircle,
      color: 'from-orange-600 to-red-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      title: 'Avg Rating',
      value: (stats?.avg_platform_rating || 0).toFixed(1),
      icon: Star,
      color: 'from-yellow-600 to-amber-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            <p className="mt-4 text-stone-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !stats) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Failed to load dashboard'}</p>
            <button
              onClick={loadDashboard}
              className="px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
            >
              Retry
            </button>
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
                  Admin Dashboard
                </h1>
                <p className="text-stone-600 mt-2">Platform overview and statistics</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg">
                <Shield size={20} />
                <span className="font-semibold">Admin</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-stone-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <TrendingUp className="text-stone-400" size={20} />
                  </div>
                  <div className={`text-3xl font-bold ${stat.textColor} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-stone-600 font-medium">{stat.title}</div>
                </div>
              );
            })}
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-100">
              <div className="text-2xl font-bold text-stone-900 mb-1">{stats.total_customers}</div>
              <div className="text-stone-600">Customers</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-100">
              <div className="text-2xl font-bold text-stone-900 mb-1">{stats.verified_providers}</div>
              <div className="text-stone-600">Verified Providers</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-100">
              <div className="text-2xl font-bold text-stone-900 mb-1">{stats.total_categories}</div>
              <div className="text-stone-600">Categories</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-100">
              <div className="text-2xl font-bold text-stone-900 mb-1">{stats.total_reviews}</div>
              <div className="text-stone-600">Total Reviews</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Users */}
            <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Users size={24} className="text-amber-700" />
                  Recent Users
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.recent_users.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-stone-50 transition-colors border border-stone-100"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-stone-900">{user.full_name || 'N/A'}</div>
                        <div className="text-sm text-stone-600">{user.email}</div>
                        <div className="text-xs text-stone-500 mt-1">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-amber-100 text-amber-800' :
                        user.role === 'provider' ? 'bg-orange-100 text-orange-800' :
                        'bg-stone-100 text-stone-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Calendar size={24} className="text-amber-700" />
                  Recent Bookings
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.recent_bookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-stone-50 transition-colors border border-stone-100"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-stone-900">
                          {booking.customer_name} → {booking.provider_name}
                        </div>
                        <div className="text-sm text-stone-600">
                          {new Date(booking.scheduled_for).toLocaleString()}
                        </div>
                        <div className="text-xs text-stone-500 mt-1">
                          ₹{booking.total_price?.toLocaleString() || '0'}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Providers */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <Award size={24} className="text-amber-700" />
                Top Providers
              </h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-3 px-4 text-stone-700 font-semibold">Provider</th>
                      <th className="text-left py-3 px-4 text-stone-700 font-semibold">Bookings</th>
                      <th className="text-left py-3 px-4 text-stone-700 font-semibold">Earnings</th>
                      <th className="text-left py-3 px-4 text-stone-700 font-semibold">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.top_providers.map((provider) => (
                      <tr key={provider.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-stone-900">{provider.provider_name}</td>
                        <td className="py-4 px-4 text-stone-600">{provider.total_bookings}</td>
                        <td className="py-4 px-4 text-stone-600">₹{provider.total_earnings.toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Star className="text-amber-500 fill-amber-500" size={16} />
                            <span className="text-stone-700 font-medium">{provider.avg_rating.toFixed(1)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

