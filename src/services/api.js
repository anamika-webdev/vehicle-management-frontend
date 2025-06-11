const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://164.52.194.198:9090/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE;
    this.token = localStorage.getItem('authToken');
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
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Vehicles
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

  // Devices
  async getDevices(managerId) {
    return this.request(`/managers/${managerId}/devices`);
  }

  async assignDevice(deviceId, vehicleId) {
    return this.request(`/devices/${deviceId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ 
        vehicle_id: vehicleId,
        installed_at: new Date().toISOString()
      }),
    });
  }

  async unassignDevice(deviceId) {
    return this.request(`/devices/${deviceId}/unassign`, {
      method: 'PUT',
      body: JSON.stringify({ 
        vehicle_id: null,
        installed_at: null
      }),
    });
  }

  // Alarms
  async getAlarms(managerId) {
    return this.request(`/managers/${managerId}/alarms`);
  }

  async updateAlarmStatus(alarmId, resolved) {
    return this.request(`/alarms/${alarmId}`, {
      method: 'PUT',
      body: JSON.stringify({ resolved }),
    });
  }
}

export default new ApiService();