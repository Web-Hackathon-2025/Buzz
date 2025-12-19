import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';
import Layout from '../components/Layout';

const CreateBooking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    scheduled_for: '',
    scheduled_time: '',
    service_address: '',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      loadProvider();
    }
  }, [id]);

  const loadProvider = async () => {
    try {
      const data = await api.getProviderProfile(id!);
      setProvider(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load provider');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const scheduledDateTime = new Date(`${formData.scheduled_for}T${formData.scheduled_time}`);
      
      if (scheduledDateTime <= new Date()) {
        setError('Please select a future date and time');
        setSubmitting(false);
        return;
      }

      await api.createBooking({
        provider_id: id!,
        scheduled_for: scheduledDateTime.toISOString(),
        service_address: formData.service_address,
        notes: formData.notes || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <Layout>
        <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md border border-stone-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Booking Confirmed!</h2>
            <p className="text-stone-600">Your booking request has been submitted successfully.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stone-600 hover:text-amber-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-stone-200">
            <h1 className="text-3xl font-bold text-stone-900 mb-2">Book Service</h1>
            {provider && (
              <p className="text-stone-600 mb-6">
                Booking with <span className="font-semibold">{provider.provider_name}</span>
              </p>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    <Calendar className="inline mr-2" size={18} />
                    Date
                  </label>
                  <input
                    type="date"
                    name="scheduled_for"
                    value={formData.scheduled_for}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    <Calendar className="inline mr-2" size={18} />
                    Time
                  </label>
                  <input
                    type="time"
                    name="scheduled_time"
                    value={formData.scheduled_time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  <MapPin className="inline mr-2" size={18} />
                  Service Address
                </label>
                <input
                  type="text"
                  name="service_address"
                  value={formData.service_address}
                  onChange={handleChange}
                  placeholder="Enter the address where service is needed"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  <FileText className="inline mr-2" size={18} />
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Any special instructions or details..."
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-amber-700 to-orange-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? 'Submitting...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateBooking;

