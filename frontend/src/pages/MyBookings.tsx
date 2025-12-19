import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Clock, X, 
  CheckCircle, AlertCircle, Star,
  Filter, Search as SearchIcon
} from 'lucide-react';
import { api } from '../utils/api';
import Layout from '../components/Layout';

interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  status: string;
  scheduled_for: string;
  service_address: string;
  total_price: number | null;
  notes: string | null;
  created_at: string;
  provider_name: string | null;
  provider_email: string | null;
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const loadBookings = async () => {
    try {
      const data = await api.getMyBookings(statusFilter || undefined);
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.cancelBooking(bookingId);
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
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
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} />;
      case 'confirmed':
        return <CheckCircle size={18} />;
      case 'pending':
        return <Clock size={18} />;
      case 'cancelled':
        return <X size={18} />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  const canCancel = (status: string) => {
    return status === 'pending' || status === 'confirmed';
  };

  const canReview = (status: string) => {
    return status === 'completed';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-stone-900 mb-2">My Bookings</h1>
              <p className="text-stone-600">Manage all your service bookings</p>
            </div>

            <div className="mt-4 md:mt-0 flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
              <p className="mt-4 text-stone-600">Loading bookings...</p>
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-stone-200 hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-stone-900 mb-1">
                            {booking.provider_name || 'Service Provider'}
                          </h3>
                          <p className="text-stone-600 text-sm">{booking.provider_email}</p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="text-amber-700 mt-1" size={20} />
                          <div>
                            <p className="text-sm text-stone-600">Scheduled Date</p>
                            <p className="font-semibold text-stone-900">
                              {new Date(booking.scheduled_for).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-sm text-stone-600">
                              {new Date(booking.scheduled_for).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="text-amber-700 mt-1" size={20} />
                          <div>
                            <p className="text-sm text-stone-600">Service Address</p>
                            <p className="font-semibold text-stone-900">{booking.service_address}</p>
                          </div>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mb-4 p-3 bg-stone-50 rounded-lg">
                          <p className="text-sm text-stone-600 mb-1">Notes:</p>
                          <p className="text-stone-700">{booking.notes}</p>
                        </div>
                      )}

                      {booking.total_price && (
                        <div className="flex items-center gap-2 text-lg font-bold text-stone-900">
                          <span>Total:</span>
                          <span className="text-amber-700">₹{booking.total_price}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 md:w-48">
                      {canCancel(booking.status) && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <X size={18} />
                          Cancel Booking
                        </button>
                      )}
                      {canReview(booking.status) && (
                        <button
                          onClick={() => navigate(`/review/${booking.id}`)}
                          className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <Star size={18} />
                          Write Review
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/provider/${booking.provider_id}`)}
                        className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors font-medium"
                      >
                        View Provider
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
              <Calendar className="mx-auto text-stone-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-stone-900 mb-2">No bookings found</h3>
              <p className="text-stone-600 mb-6">Start by searching for service providers</p>
              <button
                onClick={() => navigate('/search')}
                className="px-6 py-3 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Search Providers
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyBookings;

