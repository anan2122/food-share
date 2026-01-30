const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  data?: any;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Get token from localStorage if available (client-side only)
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { data, ...customOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(customOptions.headers || {}),
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...customOptions,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Request failed');
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      data: { email, password },
    });
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    organizationName?: string;
    address?: any;
  }) {
    const response = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      data: userData,
    });
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  async getProfile() {
    return this.request<any>('/auth/me');
  }

  async updateProfile(data: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      data,
    });
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/password', {
      method: 'PUT',
      data: { currentPassword, newPassword },
    });
  }

  // User endpoints
  async getUsers(params?: { role?: string; isVerified?: boolean; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return this.request<any[]>(`/users?${searchParams.toString()}`);
  }

  async getUser(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      data,
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async verifyUser(id: string, verified: boolean) {
    return this.request(`/users/${id}/verify`, {
      method: 'PUT',
      data: { verified },
    });
  }

  // Donation endpoints
  async getDonations(params?: {
    status?: string;
    category?: string;
    donor?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return this.request<any[]>(`/donations?${searchParams.toString()}`);
  }

  async getDonation(id: string) {
    return this.request<any>(`/donations/${id}`);
  }

  async createDonation(data: any) {
    return this.request('/donations', {
      method: 'POST',
      data,
    });
  }

  async updateDonation(id: string, data: any) {
    return this.request(`/donations/${id}`, {
      method: 'PUT',
      data,
    });
  }

  async deleteDonation(id: string) {
    return this.request(`/donations/${id}`, {
      method: 'DELETE',
    });
  }

  async claimDonation(id: string) {
    return this.request(`/donations/${id}/claim`, {
      method: 'POST',
    });
  }

  async requestFood(donationId: string) {
    return this.request(`/donations/${donationId}/request`, {
      method: 'POST',
    });
  }

  async verifyDonation(id: string, data: { verified: boolean; notes?: string }) {
    return this.request(`/donations/${id}/verify`, {
      method: 'PUT',
      data,
    });
  }

  async updateDonationStatus(id: string, status: string) {
    return this.request(`/donations/${id}/status`, {
      method: 'PUT',
      data: { status },
    });
  }

  async getMyDonations() {
    return this.request<any[]>('/donations/my-donations');
  }

  // Match endpoints
  async createMatch(data: { donationId: string; ngoId: string }) {
    return this.request('/matches', {
      method: 'POST',
      data,
    });
  }

  async getMatches(params?: { status?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return this.request<any[]>(`/matches?${searchParams.toString()}`);
  }

  // Pickup endpoints
  async getPickups(params?: { status?: string; volunteer?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return this.request<any[]>(`/pickups?${searchParams.toString()}`);
  }

  async createPickup(data: { donation: string; volunteer: string; scheduledTime: string }) {
    return this.request('/pickups', {
      method: 'POST',
      data,
    });
  }

  async updatePickupStatus(id: string, status: string) {
    return this.request(`/pickups/${id}/status`, {
      method: 'PUT',
      data: { status },
    });
  }

  async updatePickupLocation(id: string, location: { lat: number; lng: number }) {
    return this.request(`/pickups/${id}/location`, {
      method: 'PUT',
      data: { location },
    });
  }

  async completePickup(id: string, data: { notes?: string; actualQuantity?: number }) {
    return this.request(`/pickups/${id}/complete`, {
      method: 'PUT',
      data,
    });
  }

  // Notification endpoints
  async getNotifications() {
    return this.request<any[]>('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getAnalytics(params?: { startDate?: string; endDate?: string; groupBy?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return this.request<any>(`/analytics?${searchParams.toString()}`);
  }

  async getAnalyticsReports(type?: string) {
    const params = type ? `?type=${type}` : '';
    return this.request<any>(`/analytics/reports${params}`);
  }

  async getDashboardData() {
    return this.request<any>('/analytics/dashboard');
  }

  // Impact endpoints
  async getImpact() {
    return this.request<any>('/impact');
  }

  async getLeaderboard(params?: { period?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return this.request<any>(`/impact/leaderboard?${searchParams.toString()}`);
  }

  // Volunteers endpoint
  async getVolunteers(params?: { isVerified?: boolean; available?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return this.request<any[]>(`/users?role=volunteer&${searchParams.toString()}`);
  }

  async assignPickup(donationId: string, volunteerId: string) {
    return this.request('/pickups', {
      method: 'POST',
      data: { donation: donationId, volunteer: volunteerId, scheduledTime: new Date().toISOString() },
    });
  }

  // NGOs endpoint
  async getNGOs(params?: { isVerified?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return this.request<any[]>(`/users?role=ngo&${searchParams.toString()}`);
  }

  // Food Requests (for NGOs)
  async getRequests(params?: { status?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return this.request<any[]>(`/requests?${searchParams.toString()}`);
  }

  async createRequest(data: { donationId: string; notes?: string }) {
    return this.request('/requests', {
      method: 'POST',
      data,
    });
  }

  async cancelRequest(id: string) {
    return this.request(`/requests/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;
export { ApiClient, API_BASE_URL };
export type { ApiResponse };
