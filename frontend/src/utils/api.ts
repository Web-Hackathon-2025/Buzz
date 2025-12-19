const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  },

  // Categories
  getCategories() {
    return this.request('/customers/categories');
  },

  // Providers
  searchProviders(params: {
    latitude: number;
    longitude: number;
    category_id?: number;
    min_rating?: number;
    max_price?: number;
    min_price?: number;
    radius_km?: number;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    return this.request(`/customers/providers/search?${queryParams}`);
  },

  getProviderProfile(providerId: string) {
    return this.request(`/customers/providers/${providerId}`);
  },

  // Bookings
  createBooking(data: {
    provider_id: string;
    scheduled_for: string;
    service_address: string;
    notes?: string;
  }) {
    return this.request('/customers/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyBookings(status?: string) {
    const endpoint = status 
      ? `/customers/bookings?status=${status}`
      : '/customers/bookings';
    return this.request(endpoint);
  },

  getBooking(bookingId: string) {
    return this.request(`/customers/bookings/${bookingId}`);
  },

  cancelBooking(bookingId: string) {
    return this.request(`/customers/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  },

  // Reviews
  createReview(data: {
    booking_id: string;
    rating: number;
    comment?: string;
  }) {
    return this.request('/customers/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyReviews() {
    return this.request('/customers/reviews/my');
  },

  // Auth
  login(data: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  signup(data: { email: string; password: string; full_name: string; phone?: string }) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

