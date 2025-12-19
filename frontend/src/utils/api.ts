const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
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

  // Admin APIs
  getAdminDashboard() {
    return this.request('/admins/dashboard');
  },

  getAdminUsers(params?: { role?: string; page?: number; page_size?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    const query = queryParams.toString();
    return this.request(`/admins/users${query ? `?${query}` : ''}`);
  },

  getAdminUser(userId: string) {
    return this.request(`/admins/users/${userId}`);
  },

  updateUserRole(userId: string, role: string) {
    return this.request(`/admins/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  updateUserStatus(userId: string, isActive: boolean) {
    return this.request(`/admins/users/${userId}/status?is_active=${isActive}`, {
      method: 'PUT',
    });
  },

  getPendingProviders() {
    return this.request('/admins/providers/pending');
  },

  verifyProvider(providerId: string, isVerified: boolean) {
    return this.request(`/admins/providers/${providerId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ is_verified: isVerified }),
    });
  },

  getAdminCategories() {
    return this.request('/admins/categories');
  },

  createCategory(data: { name: string; icon_url?: string }) {
    return this.request('/admins/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCategory(categoryId: number, data: { name?: string; icon_url?: string }) {
    return this.request(`/admins/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCategory(categoryId: number) {
    return this.request(`/admins/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },

  getAdminBookings(params?: { status?: string; page?: number; page_size?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    const query = queryParams.toString();
    return this.request(`/admins/bookings${query ? `?${query}` : ''}`);
  },

  getAdminBooking(bookingId: string) {
    return this.request(`/admins/bookings/${bookingId}`);
  },

  getAdminReviews(params?: { page?: number; page_size?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    const query = queryParams.toString();
    return this.request(`/admins/reviews${query ? `?${query}` : ''}`);
  },

  deleteReview(reviewId: string) {
    return this.request(`/admins/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },

  // Provider APIs
  getProviderDashboard() {
    return this.request('/providers/dashboard');
  },

  getProviderProfile() {
    return this.request('/providers/profile');
  },

  updateProviderProfile(data: {
    category_id?: number;
    bio?: string;
    base_price?: number;
    latitude?: number;
    longitude?: number;
  }) {
    return this.request('/providers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getProviderAvailability() {
    return this.request('/providers/availability');
  },

  createAvailability(data: {
    day_of_week: number;
    start_time: string;
    end_time: string;
  }) {
    return this.request('/providers/availability', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAvailability(availabilityId: string, data: {
    start_time?: string;
    end_time?: string;
  }) {
    return this.request(`/providers/availability/${availabilityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAvailability(availabilityId: string) {
    return this.request(`/providers/availability/${availabilityId}`, {
      method: 'DELETE',
    });
  },

  getProviderBookings(params?: { status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString();
    return this.request(`/providers/bookings${query ? `?${query}` : ''}`);
  },

  getProviderBooking(bookingId: string) {
    return this.request(`/providers/bookings/${bookingId}`);
  },

  acceptBooking(bookingId: string) {
    return this.request(`/providers/bookings/${bookingId}/accept`, {
      method: 'PUT',
    });
  },

  rejectBooking(bookingId: string) {
    return this.request(`/providers/bookings/${bookingId}/reject`, {
      method: 'PUT',
    });
  },

  rescheduleBooking(bookingId: string, scheduledFor: string) {
    return this.request(`/providers/bookings/${bookingId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ scheduled_for: scheduledFor }),
    });
  },

  completeBooking(bookingId: string) {
    return this.request(`/providers/bookings/${bookingId}/complete`, {
      method: 'PUT',
    });
  },

  getProviderReviews(params?: { limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    const query = queryParams.toString();
    return this.request(`/providers/reviews${query ? `?${query}` : ''}`);
  },
};

