import { useState, useEffect } from 'react';
import { 
  Calendar, Search, Filter, Clock, DollarSign,
  CheckCircle, XCircle, AlertCircle, Eye
} from 'lucide-react';
import { api } from '../utils/api';
import Layout from '../components/Layout';

interface Booking {
  id: string;
  status: string;
  scheduled_for: string;
  total_price: number;
  customer_name: string;
  provider_name: string;
  service_address: string;
  created_at: string;
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadBookings();
  }, [page, statusFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params: any = { page, page_size: pageSize };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const data = await api.getAdminBookings(params);
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            <p className="mt-4 text-stone-600">Loading bookings...</p>
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
                  Booking Management
                </h1>
                <p className="text-stone-600 mt-2">View and manage all platform bookings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-6 mb-6">
            <div className="flex items-center gap-4">
              <Filter size={20} className="text-stone-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-stone-700 font-semibold">Booking ID</th>
                    <th className="text-left py-4 px-6 text-stone-700 font-semibold">Customer</th>
                    <th className="text-left py-4 px-6 text-stone-700 font-semibold">Provider</th>
                    <th className="text-left py-4 px-6 text-stone-700 font-semibold">Scheduled</th>
                    <th className="text-left py-4 px-6 text-stone-700 font-semibold">Amount</th>
                    <th className="text-left py-4 px-6 text-stone-700 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 text-stone-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-mono text-sm text-stone-600">
                          {booking.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-stone-900">{booking.customer_name}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-stone-900">{booking.provider_name}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-stone-600">
                          <Clock size={16} />
                          <span>{new Date(booking.scheduled_for).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-stone-700 font-semibold">
                          <DollarSign size={16} />
                          {booking.total_price?.toLocaleString() || '0'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => {
                            // Navigate to booking details
                            window.location.href = `/admin/bookings/${booking.id}`;
                          }}
                          className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-2"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-between">
              <div className="text-stone-600">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} bookings
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * pageSize >= total}
                  className="px-4 py-2 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminBookings;

