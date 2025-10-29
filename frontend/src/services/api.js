const API_URL = "http://localhost:5000/api";

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  // Listings endpoints
  async getListings() {
    return this.request('/listings');
  }

  async getListing(id) {
    return this.request(`/listings/${id}`);
  }

  async createListing(listingData) {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  async updateListing(id, listingData) {
    return this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
  }

  async deleteListing(id) {
    return this.request(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  // Bidding endpoints
  async placeBid(listingId, amount) {
    return this.request(`/auctions/${listingId}/bids`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Rating endpoints
  async getRatings(userId, page = 1, limit = 10) {
    return this.request(`/ratings/user/${userId}?page=${page}&limit=${limit}`);
  }

  async createRating(ratingData) {
    return this.request('/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  }

  async updateRating(ratingId, ratingData) {
    return this.request(`/ratings/${ratingId}`, {
      method: 'PUT',
      body: JSON.stringify(ratingData),
    });
  }

  async deleteRating(ratingId) {
    return this.request(`/ratings/${ratingId}`, {
      method: 'DELETE',
    });
  }

  // Review endpoints
  async getReviews(userId, page = 1, limit = 10, sortBy = 'newest') {
    return this.request(`/reviews/user/${userId}?page=${page}&limit=${limit}&sortBy=${sortBy}`);
  }

  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(reviewId, reviewData) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(reviewId) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  async voteReview(reviewId, helpful) {
    return this.request(`/reviews/${reviewId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    });
  }

  async respondToReview(reviewId, response) {
    return this.request(`/reviews/${reviewId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  // Notification endpoints
  async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    return this.request(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
  }

  async markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Transaction endpoints
  async getTransactions(page = 1, limit = 10, status, type) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    return this.request(`/transactions?${params}`);
  }

  async getTransaction(transactionId) {
    return this.request(`/transactions/${transactionId}`);
  }

  async createTransaction(transactionData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransactionStatus(transactionId, status, data = {}) {
    return this.request(`/transactions/${transactionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...data }),
    });
  }

  // Report endpoints
  async createReport(reportData) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getReports(page = 1, limit = 20, status, type) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    return this.request(`/reports?${params}`);
  }

  async getReport(reportId) {
    return this.request(`/reports/${reportId}`);
  }
}

export default new ApiService();
