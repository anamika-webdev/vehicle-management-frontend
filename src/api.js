// Enhanced API Service for Vehicle Management Dashboard
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://164.52.194.198:9091/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE;
    this.token = null; // Will be set after login
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making request to: ${url}`, config);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }
      
      const data = await response.json();
      console.log(`Response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.token) {
        this.token = response.token;
        // Store token in localStorage for persistence
        localStorage.setItem('authToken', response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Initialize token from localStorage
  initializeToken() {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      this.token = storedToken;
    }
  }

  // Manager Operations
  async getManagerProfile(managerId) {
    return this.request(`/managers/${managerId}`);
  }

  async getDashboardSummary(managerId) {
    return this.request(`/managers/${managerId}/dashboard`);
  }

  // Vehicle Operations
  async getVehicles(managerId) {
    return this.request(`/managers/${managerId}/vehicles`);
  }

  async createVehicle(vehicleData) {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async updateVehicle(vehicleId, vehicleData) {
    return this.request(`/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async deleteVehicle(vehicleId) {
    return this.request(`/vehicles/${vehicleId}`, {
      method: 'DELETE',
    });
  }

  // Device Operations
  async getDevices(managerId) {
    return this.request(`/managers/${managerId}/devices`);
  }

  async createDevice(deviceData) {
    return this.request('/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  }

  async updateDevice(deviceId, deviceData) {
    return this.request(`/devices/${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify(deviceData),
    });
  }

  async deleteDevice(deviceId) {
    return this.request(`/devices/${deviceId}`, {
      method: 'DELETE',
    });
  }

  async assignDevice(deviceId, vehicleId) {
    return this.request(`/devices/${deviceId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ 
        vehicle_id: vehicleId,
        status: 'Active',
        installed_at: new Date().toISOString()
      }),
    });
  }

  async unassignDevice(deviceId) {
    return this.request(`/devices/${deviceId}/unassign`, {
      method: 'PUT',
      body: JSON.stringify({ 
        vehicle_id: null,
        status: 'Unassigned',
        installed_at: null
      }),
    });
  }

  // Alarm Operations
  async getAlarms(managerId) {
    return this.request(`/managers/${managerId}/alarms`);
  }

  async createAlarm(alarmData) {
    return this.request('/alarms', {
      method: 'POST',
      body: JSON.stringify(alarmData),
    });
  }

  async updateAlarm(alarmId, alarmData) {
    return this.request(`/alarms/${alarmId}`, {
      method: 'PUT',
      body: JSON.stringify(alarmData),
    });
  }

  async deleteAlarm(alarmId) {
    return this.request(`/alarms/${alarmId}`, {
      method: 'DELETE',
    });
  }

  async resolveAlarm(alarmId, managerId) {
    return this.request(`/alarms/${alarmId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ 
        resolved: true,
        resolved_by: managerId,
        resolved_at: new Date().toISOString()
      }),
    });
  }

  // Utility Methods
  async testConnection() {
    try {
      const response = await this.request('/health');
      return response;
    } catch (error) {
      console.error('Connection test failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Batch operations for efficiency
  async getManagerData(managerId) {
    try {
      const [vehicles, devices, alarms] = await Promise.all([
        this.getVehicles(managerId),
        this.getDevices(managerId),
        this.getAlarms(managerId)
      ]);

      return { vehicles, devices, alarms };
    } catch (error) {
      console.error('Failed to fetch manager data:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

// Initialize token on app start
apiService.initializeToken();

export default apiService;