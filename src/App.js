import React, { useState, useEffect, useRef } from 'react';
import { Car, Shield, Bell, User, Plus, Edit, Trash2, Search, RefreshCw, LogOut, Settings, Link, Wifi, WifiOff, X, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

// API Service
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9091/api';

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
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  async getManagerData(managerId) {
    const [vehicles, devices, alarms] = await Promise.all([
      this.request(`/managers/${managerId}/vehicles`),
      this.request(`/managers/${managerId}/devices`),
      this.request(`/managers/${managerId}/alarms`)
    ]);
    return { vehicles, devices, alarms };
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
}

const apiService = new ApiService();

// Mock data fallback
const mockData = {
  vehicles: [
    { vehicle_id: 1, manager_id: 1, manufacturer: 'Toyota', model: 'Camry', vehicle_number: 'ABC123', vehicle_type: 'Sedan' },
    { vehicle_id: 2, manager_id: 1, manufacturer: 'Honda', model: 'Civic', vehicle_number: 'XYZ789', vehicle_type: 'Sedan' },
    { vehicle_id: 3, manager_id: 2, manufacturer: 'Ford', model: 'F-150', vehicle_number: 'DEF456', vehicle_type: 'Truck' },
    { vehicle_id: 4, manager_id: 1, manufacturer: 'BMW', model: 'X5', vehicle_number: 'GHI789', vehicle_type: 'SUV' }
  ],
  devices: [
    { 
      device_id: 1, 
      manager_id: 1, 
      vehicle_id: 1, 
      device_name: 'GPS Tracker 1', 
      device_type: 'GPS', 
      status: 'Active', 
      installed_at: '2024-01-15',
      acceleration: 2.5,
      latitude: 28.6139,
      longitude: 77.2090,
      drowsiness_level: 15,
      rash_driving: false,
      collision_detected: false,
      last_updated: '2024-06-11T10:30:00Z'
    },
    { 
      device_id: 2, 
      manager_id: 1, 
      vehicle_id: 2, 
      device_name: 'Alarm System 1', 
      device_type: 'Security', 
      status: 'Active', 
      installed_at: '2024-01-20',
      acceleration: 1.2,
      latitude: 28.7041,
      longitude: 77.1025,
      drowsiness_level: 5,
      rash_driving: true,
      collision_detected: false,
      last_updated: '2024-06-11T10:15:00Z'
    },
    { 
      device_id: 3, 
      manager_id: 2, 
      vehicle_id: 3, 
      device_name: 'Camera System', 
      device_type: 'Surveillance', 
      status: 'Inactive', 
      installed_at: '2024-02-01',
      acceleration: 0,
      latitude: 28.5355,
      longitude: 77.3910,
      drowsiness_level: 0,
      rash_driving: false,
      collision_detected: true,
      last_updated: '2024-06-11T09:45:00Z'
    },
    { 
      device_id: 4, 
      manager_id: 1, 
      vehicle_id: null, 
      device_name: 'GPS Tracker 2', 
      device_type: 'GPS', 
      status: 'Unassigned', 
      installed_at: null,
      acceleration: 0,
      latitude: 0,
      longitude: 0,
      drowsiness_level: 0,
      rash_driving: false,
      collision_detected: false,
      last_updated: null
    }
  ],
  alarms: [
    { alarm_id: 1, device_id: 1, alarm_time: '2024-06-08 10:30:00', alarm_type: 'Speed Alert', description: 'Vehicle exceeded speed limit', resolved: false, severity: 'medium' },
    { alarm_id: 2, device_id: 2, alarm_time: '2024-06-08 14:15:00', alarm_type: 'Rash Driving', description: 'Aggressive driving detected', resolved: false, severity: 'high' },
    { alarm_id: 3, device_id: 1, alarm_time: '2024-06-08 16:45:00', alarm_type: 'GPS Signal Lost', description: 'GPS signal interrupted', resolved: false, severity: 'low' },
    { alarm_id: 4, device_id: 3, alarm_time: '2024-06-11 09:45:00', alarm_type: 'Collision Alert', description: 'Collision detected on vehicle', resolved: false, severity: 'critical' }
  ],
  managers: [
    { manager_id: 1, name: 'John Smith', email: 'john@company.com', phone_number: '+1-555-0101', password: 'admin123' },
    { manager_id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', phone_number: '+1-555-0102', password: 'manager456' }
  ]
};

const Dashboard = () => {
  // Basic state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({ vehicles: [], devices: [], alarms: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({});

  // Real-time state
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [deviceSimulations, setDeviceSimulations] = useState(new Map());
  const websocketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Helper functions
  const hasDeviceAlerts = (device) => {
    if (!device.vehicle_id) return false;
    
    const criticalConditions = [
      device.drowsiness_level > 20,
      device.rash_driving,
      device.collision_detected,
      device.acceleration > 3.0
    ];
    
    return criticalConditions.some(condition => condition);
  };

  const getDeviceAlertLevel = (device) => {
    if (device.collision_detected) return 'critical';
    if (device.rash_driving || device.drowsiness_level > 30) return 'high';
    if (device.drowsiness_level > 20 || device.acceleration > 3.0) return 'medium';
    return 'normal';
  };

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    
    try {
      const response = await apiService.login(loginForm.email, loginForm.password);
      
      if (response.success && response.manager) {
        setCurrentUser(response.manager);
        setIsLoggedIn(true);
        setLoginForm({ email: '', password: '' });
        await fetchData(response.manager.manager_id);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('API login failed, trying mock login:', error);
      
      const manager = mockData.managers.find(m => 
        m.email === loginForm.email && m.password === loginForm.password
      );
      
      if (manager) {
        setCurrentUser(manager);
        setIsLoggedIn(true);
        setLoginForm({ email: '', password: '' });
        const filteredData = {
          vehicles: mockData.vehicles.filter(v => v.manager_id === manager.manager_id),
          devices: mockData.devices.filter(d => d.manager_id === manager.manager_id),
          alarms: mockData.alarms.filter(a => {
            const device = mockData.devices.find(d => d.device_id === a.device_id);
            return device && device.manager_id === manager.manager_id;
          })
        };
        setData(filteredData);
      } else {
        setLoginError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setActiveTab('overview');
    localStorage.removeItem('authToken');
    if (websocketRef.current) {
      websocketRef.current.close();
    }
  };

  // Fetch data from API or use mock data
  const fetchData = async (managerId = currentUser?.manager_id) => {
    if (!managerId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const apiData = await apiService.getManagerData(managerId);
      setData(apiData);
      setError('');
    } catch (error) {
      console.error('Failed to fetch data from API:', error);
      setError('Failed to connect to server. Using offline data.');
      
      const filteredData = {
        vehicles: mockData.vehicles.filter(v => v.manager_id === managerId),
        devices: mockData.devices.filter(d => d.manager_id === managerId),
        alarms: mockData.alarms.filter(a => {
          const device = mockData.devices.find(d => d.device_id === a.device_id);
          return device && device.manager_id === managerId;
        })
      };
      setData(filteredData);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!currentUser) return;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:8080');
        websocketRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          ws.send(JSON.stringify({
            type: 'authenticate',
            manager_id: currentUser.manager_id
          }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleRealTimeMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (currentUser) {
              connectWebSocket();
            }
          }, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };

      } catch (error) {
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [currentUser]);

  const handleRealTimeMessage = (message) => {
    switch (message.type) {
      case 'device_update':
        handleRealTimeDeviceUpdate(message);
        break;
      case 'alarm_generated':
        handleNewAlarm(message);
        break;
      default:
        break;
    }
  };

  const handleRealTimeDeviceUpdate = (message) => {
    const { device_id, telemetry, new_alarms } = message;

    setData(prevData => ({
      ...prevData,
      devices: prevData.devices.map(device => 
        device.device_id === device_id 
          ? { 
              ...device, 
              ...telemetry,
              last_updated: message.timestamp
            }
          : device
      ),
      alarms: new_alarms.length > 0 
        ? [...new_alarms.map(alarm => ({
            ...alarm,
            alarm_id: Date.now() + Math.random(),
            device_id: device_id,
            alarm_time: message.timestamp,
            resolved: false
          })), ...prevData.alarms]
        : prevData.alarms
    }));

    if (telemetry.collision_detected || telemetry.rash_driving || telemetry.drowsiness_level > 30) {
      showCriticalNotification(device_id, telemetry);
    }
  };

  const handleNewAlarm = (message) => {
    // Handle new alarm message
    console.log('New alarm received:', message);
  };

  const showCriticalNotification = (deviceId, telemetry) => {
    const alertMessages = [];
    
    if (telemetry.collision_detected) alertMessages.push('🚨 COLLISION DETECTED');
    if (telemetry.rash_driving) alertMessages.push('⚠️ RASH DRIVING');
    if (telemetry.drowsiness_level > 30) alertMessages.push(`😴 HIGH DROWSINESS (${telemetry.drowsiness_level}%)`);

    const notification = {
      id: Date.now(),
      type: 'critical',
      title: `Device ${deviceId} - CRITICAL ALERT`,
      message: alertMessages.join(' | '),
      timestamp: new Date().toISOString(),
      deviceId
    };

    setNotifications(prev => [notification, ...prev.slice(0, 9)]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 10000);
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalType('');
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        manager_id: currentUser.manager_id
      };

      if (modalType === 'add') {
        switch (activeTab) {
          case 'vehicles':
            await apiService.createVehicle(dataToSubmit);
            break;
          default:
            console.log('Add operation not implemented for', activeTab);
            return;
        }
      } else if (modalType === 'edit') {
        switch (activeTab) {
          case 'vehicles':
            await apiService.updateVehicle(selectedItem.vehicle_id, dataToSubmit);
            break;
          default:
            console.log('Edit operation not implemented for', activeTab);
            return;
        }
      }
      
      closeModal();
      await fetchData();
      setError('');
    } catch (error) {
      setError(`Failed to save changes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    try {
      switch (type) {
        case 'vehicle':
          await apiService.deleteVehicle(id);
          break;
        default:
          console.log('Delete operation not implemented for', type);
          return;
      }
      
      await fetchData();
      setError('');
    } catch (error) {
      setError(`Failed to delete ${type}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceAssignment = async (deviceId, vehicleId) => {
    setLoading(true);
    try {
      if (vehicleId === 'unassign' || !vehicleId) {
        await apiService.unassignDevice(deviceId);
      } else {
        await apiService.assignDevice(deviceId, parseInt(vehicleId));
      }
      
      await fetchData();
      setError('');
    } catch (error) {
      setError(`Failed to update device assignment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Connection status component
  const ConnectionStatus = () => (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="text-xs text-green-600">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-600" />
          <span className="text-xs text-red-600">Offline</span>
        </>
      )}
    </div>
  );

  // Notification panel component
  const NotificationPanel = () => (
    <div className="fixed z-50 max-w-sm top-4 right-4">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`mb-2 p-4 rounded-lg shadow-lg border-l-4 bg-white animate-slide-in ${
            notification.type === 'critical' ? 'border-red-500' : 'border-blue-500'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`font-bold text-sm ${
                notification.type === 'critical' ? 'text-red-800' : 'text-blue-800'
              }`}>
                {notification.title}
              </h4>
              <p className="mt-1 text-xs text-gray-600">{notification.message}</p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Device status component
  const DeviceStatusCard = ({ device }) => {
    const vehicle = data.vehicles.find(v => v.vehicle_id === device.vehicle_id);
    const alertLevel = getDeviceAlertLevel(device);
    
    return (
      <div className={`p-4 rounded-lg border-l-4 ${
        alertLevel === 'critical' ? 'border-red-500 bg-red-50' :
        alertLevel === 'high' ? 'border-orange-500 bg-orange-50' :
        alertLevel === 'medium' ? 'border-yellow-500 bg-yellow-50' :
        'border-green-500 bg-green-50'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{device.device_name}</h4>
            <p className="text-sm text-gray-600">{device.device_type}</p>
            {vehicle && (
              <p className="text-xs text-gray-500">{vehicle.vehicle_number}</p>
            )}
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 rounded-full text-xs ${
              device.status === 'Active' ? 'bg-green-100 text-green-800' :
              device.status === 'Unassigned' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {device.status}
            </span>
          </div>
        </div>
        
        {device.vehicle_id && (
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div>
              <span className="text-gray-500">Acceleration:</span>
              <span className="ml-1 font-medium">{device.acceleration || 0} m/s²</span>
            </div>
            <div>
              <span className="text-gray-500">Drowsiness:</span>
              <span className={`ml-1 font-medium ${
                device.drowsiness_level > 30 ? 'text-red-600' :
                device.drowsiness_level > 20 ? 'text-orange-600' :
                'text-green-600'
              }`}>
                {device.drowsiness_level || 0}%
              </span>
            </div>
            <div className="flex col-span-2 gap-2">
              {device.rash_driving && (
                <span className="px-2 py-1 text-xs text-red-800 bg-red-100 rounded">
                  Rash Driving
                </span>
              )}
              {device.collision_detected && (
                <span className="px-2 py-1 text-xs text-red-800 bg-red-100 rounded">
                  Collision
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Login Screen Component
  const LoginScreen = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-2xl">
        <div className="mb-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="text-gray-600">Manager Login</p>
        </div>
        
        <form onSubmit={handleLogin}>
          {loginError && (
            <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
              {loginError}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-sm text-center text-gray-600">
          <p>Demo Credentials:</p>
          <p>john@company.com / admin123</p>
          <p>sarah@company.com / manager456</p>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="p-6 bg-white border-l-4 rounded-lg shadow-md" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
    </div>
  );

  const DataTable = ({ title, headers, rows, onAdd, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={() => onAdd()}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  {header}
                </th>
              ))}
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {Object.values(row).map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {cell}
                  </td>
                ))}
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(row)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(Object.values(row)[0])}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const DeviceAssignmentView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Device Assignment</h3>
          <p className="mt-1 text-sm text-gray-600">Assign devices to your vehicles</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Unassigned Devices */}
            <div>
              <h4 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 text-md">
                <Shield className="w-5 h-5" />
                Available Devices
              </h4>
              <div className="space-y-3 overflow-y-auto max-h-96">
                {data.devices.filter(device => !device.vehicle_id).map((device) => (
                  <div key={device.device_id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-gray-900">{device.device_name}</h5>
                        <p className="text-sm text-gray-600">{device.device_type}</p>
                        <span className="inline-block px-2 py-1 mt-1 text-xs text-yellow-800 bg-yellow-100 rounded-full">
                          {device.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleDeviceAssignment(device.device_id, e.target.value);
                          }
                        }}
                        className="flex-1 p-2 text-sm border border-gray-300 rounded"
                        defaultValue=""
                      >
                        <option value="">Select Vehicle</option>
                        {data.vehicles.map((vehicle) => (
                          <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                            {vehicle.vehicle_number} - {vehicle.manufacturer} {vehicle.model}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {data.devices.filter(device => !device.vehicle_id).length === 0 && (
                  <p className="py-8 text-center text-gray-500">No unassigned devices available</p>
                )}
              </div>
            </div>

            {/* Assigned Devices */}
            <div>
              <h4 className="flex items-center gap-2 mb-4 font-semibold text-gray-900 text-md">
                <Car className="w-5 h-5" />
                Vehicle-Device Assignments
              </h4>
              <div className="space-y-3 overflow-y-auto max-h-96">
                {data.vehicles.map((vehicle) => {
                  const assignedDevices = data.devices.filter(device => device.vehicle_id === vehicle.vehicle_id);
                  return (
                    <div key={vehicle.vehicle_id} className="p-4 border rounded-lg">
                      <div className="mb-3">
                        <h5 className="font-medium text-gray-900">
                          {vehicle.vehicle_number} - {vehicle.manufacturer} {vehicle.model}
                        </h5>
                        <p className="text-sm text-gray-600">{vehicle.vehicle_type}</p>
                      </div>
                      
                      {assignedDevices.length > 0 ? (
                        <div className="space-y-2">
                          {assignedDevices.map((device) => (
                            <div key={device.device_id} className="flex items-center justify-between p-2 rounded bg-green-50">
                              <div>
                                <span className="text-sm font-medium text-green-900">{device.device_name}</span>
                                <span className="ml-2 text-xs text-green-700">({device.device_type})</span>
                              </div>
                              <button
                                onClick={() => handleDeviceAssignment(device.device_id, 'unassign')}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Unassign
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No devices assigned</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard 
          title="Total Devices" 
          value={data.devices.length} 
          icon={Shield} 
          color="#3B82F6" 
        />
        <StatCard 
          title="Assigned Devices" 
          value={data.devices.filter(d => d.vehicle_id !== null).length} 
          icon={Link} 
          color="#10B981" 
        />
        <StatCard 
          title="Unassigned Devices" 
          value={data.devices.filter(d => d.vehicle_id === null).length} 
          icon={Settings} 
          color="#F59E0B" 
        />
      </div>
    </div>
  );

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md p-6 overflow-y-auto bg-white rounded-lg max-h-96">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-xl text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const FormField = ({ label, type = 'text', value, onChange, options = [] }) => (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
      {type === 'select' ? (
        <select
          value={value}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select {label}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Vehicles" value={data.vehicles.length} icon={Car} color="#3B82F6" />
        <StatCard title="Active Devices" value={data.devices.filter(d => d.status === 'Active').length} icon={Shield} color="#10B981" />
        <StatCard title="Active Alarms" value={data.alarms.filter(a => !a.resolved).length} icon={Bell} color="#EF4444" />
        <StatCard title="Unassigned Devices" value={data.devices.filter(d => !d.vehicle_id).length} icon={Settings} color="#F59E0B" />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold">Recent Alarms</h3>
          <div className="space-y-3">
            {data.alarms.slice(0, 5).map((alarm) => (
              <div key={alarm.alarm_id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm font-medium">{alarm.alarm_type}</p>
                  <p className="text-xs text-gray-600">{alarm.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    alarm.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    alarm.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    alarm.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alarm.severity}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${alarm.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {alarm.resolved ? 'Resolved' : 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold">Device Status</h3>
          <div className="space-y-3">
            {data.devices.slice(0, 5).map((device) => (
              <DeviceStatusCard key={device.device_id} device={device} />
            ))}
          </div>
        </div>
      </div>

      {/* Real-time monitoring section */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Real-Time Monitoring</h3>
          <ConnectionStatus />
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.devices.filter(d => d.vehicle_id && d.status === 'Active').map((device) => {
            const vehicle = data.vehicles.find(v => v.vehicle_id === device.vehicle_id);
            const hasAlerts = hasDeviceAlerts(device);
            
            return (
              <div key={device.device_id} className={`p-4 rounded-lg border ${
                hasAlerts ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium">{vehicle?.vehicle_number}</h4>
                    <p className="text-xs text-gray-600">{device.device_name}</p>
                  </div>
                  {hasAlerts && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span>{device.latitude?.toFixed(4)}, {device.longitude?.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Acceleration:</span>
                    <span className={device.acceleration > 3 ? 'text-red-600 font-medium' : ''}>
                      {device.acceleration} m/s²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Drowsiness:</span>
                    <span className={
                      device.drowsiness_level > 30 ? 'text-red-600 font-medium' :
                      device.drowsiness_level > 20 ? 'text-orange-600 font-medium' : ''
                    }>
                      {device.drowsiness_level}%
                    </span>
                  </div>
                  {device.last_updated && (
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span>{new Date(device.last_updated).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
                
                {/* Device simulation controls for testing */}
                <div className="flex gap-1 mt-3">
                  <button
                    onClick={() => startDeviceSimulation(device.device_id, 'collision')}
                    className="px-2 py-1 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200"
                  >
                    Test Collision
                  </button>
                  <button
                    onClick={() => startDeviceSimulation(device.device_id, 'drowsiness')}
                    className="px-2 py-1 text-xs text-orange-700 bg-orange-100 rounded hover:bg-orange-200"
                  >
                    Test Drowsy
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'assign':
        return <DeviceAssignmentView />;
      case 'vehicles':
        return (
          <DataTable
            title="My Vehicles"
            headers={['ID', 'Manufacturer', 'Model', 'Number', 'Type']}
            rows={data.vehicles.map(({ manager_id, ...rest }) => rest)}
            onAdd={() => openModal('add', 'vehicle')}
            onEdit={(item) => openModal('edit', item)}
            onDelete={(id) => handleDelete('vehicle', id)}
          />
        );
      case 'devices':
        return (
          <div className="space-y-6">
            <DataTable
              title="My Devices"
              headers={['ID', 'Vehicle ID', 'Name', 'Type', 'Status', 'Installed']}
              rows={data.devices.map(({ manager_id, ...rest }) => ({
                ...rest,
                vehicle_id: rest.vehicle_id || 'Unassigned'
              }))}
              onAdd={() => openModal('add', 'device')}
              onEdit={(item) => openModal('edit', item)}
              onDelete={(id) => handleDelete('device', id)}
            />
            
            {/* Real-time device monitoring */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-4 text-lg font-semibold">Real-Time Device Status</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.devices.filter(d => d.status === 'Active').map((device) => (
                  <DeviceStatusCard key={device.device_id} device={device} />
                ))}
              </div>
            </div>
          </div>
        );
      case 'alarms':
        return (
          <div className="space-y-6">
            <DataTable
              title="My Alarms"
              headers={['ID', 'Device ID', 'Time', 'Type', 'Description', 'Severity', 'Resolved']}
              rows={data.alarms.map(alarm => ({
                ...alarm,
                resolved: alarm.resolved ? 'Yes' : 'No'
              }))}
              onAdd={() => openModal('add', 'alarm')}
              onEdit={(item) => openModal('edit', item)}
              onDelete={(id) => handleDelete('alarm', id)}
            />
            
            {/* Critical alarms section */}
            <div className="p-6 border border-red-200 rounded-lg bg-red-50">
              <h3 className="mb-4 text-lg font-semibold text-red-800">Critical Alarms</h3>
              <div className="space-y-3">
                {data.alarms.filter(a => !a.resolved && a.severity === 'critical').map((alarm) => {
                  const device = data.devices.find(d => d.device_id === alarm.device_id);
                  const vehicle = data.vehicles.find(v => v.vehicle_id === device?.vehicle_id);
                  
                  return (
                    <div key={alarm.alarm_id} className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-red-800">{alarm.alarm_type}</p>
                        <p className="text-xs text-gray-600">{alarm.description}</p>
                        <p className="text-xs text-gray-500">
                          Vehicle: {vehicle?.vehicle_number} | Device: {device?.device_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs text-red-800 bg-red-100 rounded-full">
                          CRITICAL
                        </span>
                        <button
                          onClick={() => handleResolveAlarm(alarm.alarm_id)}
                          className="px-3 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  );
                })}
                {data.alarms.filter(a => !a.resolved && a.severity === 'critical').length === 0 && (
                  <p className="text-center text-green-700">No critical alarms</p>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  // Device simulation function
  const startDeviceSimulation = async (deviceId, scenario = 'normal') => {
    try {
      // Simulate the effect locally for immediate feedback
      const simulatedData = {
        collision: { collision_detected: true, acceleration: 5.2 },
        drowsiness: { drowsiness_level: 85, rash_driving: false },
        rash_driving: { rash_driving: true, acceleration: 4.1 },
        normal: { collision_detected: false, drowsiness_level: 5, rash_driving: false, acceleration: 1.0 }
      };

      const update = simulatedData[scenario] || simulatedData.normal;
      
      // Update local state immediately
      setData(prevData => ({
        ...prevData,
        devices: prevData.devices.map(device => 
          device.device_id === deviceId 
            ? { 
                ...device, 
                ...update,
                last_updated: new Date().toISOString()
              }
            : device
        )
      }));

      // Show notification
      if (scenario !== 'normal') {
        showCriticalNotification(deviceId, update);
      }

      setNotifications(prev => [{
        id: Date.now(),
        type: 'info',
        title: 'Device Simulation',
        message: `Simulated ${scenario} scenario for device ${deviceId}`,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);

    } catch (error) {
      console.error('Simulation failed:', error);
    }
  };

  const handleResolveAlarm = async (alarmId) => {
    try {
      // Update local state immediately
      setData(prevData => ({
        ...prevData,
        alarms: prevData.alarms.map(alarm => 
          alarm.alarm_id === alarmId 
            ? { ...alarm, resolved: true }
            : alarm
        )
      }));

      // Try API call
      await apiService.resolveAlarm(alarmId, currentUser.manager_id);
    } catch (error) {
      console.error('Failed to resolve alarm:', error);
      // Revert local state if API fails
      setData(prevData => ({
        ...prevData,
        alarms: prevData.alarms.map(alarm => 
          alarm.alarm_id === alarmId 
            ? { ...alarm, resolved: false }
            : alarm
        )
      }));
    }
  };

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Notification Panel */}
      <NotificationPanel />

      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Management Dashboard</h1>
            <div className="flex items-center gap-4">
              <ConnectionStatus />
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Welcome, {currentUser.name}</span>
              </div>
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={fetchData}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Refresh"
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {error && (
            <div className="p-3 mt-2 text-sm text-yellow-700 bg-yellow-100 border border-yellow-400 rounded-lg">
              ⚠️ {error}
            </div>
          )}
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Shield },
              { id: 'assign', label: 'Assign Devices', icon: Link },
              { id: 'vehicles', label: 'My Vehicles', icon: Car },
              { id: 'devices', label: 'My Devices', icon: Shield },
              { id: 'alarms', label: 'Alarms', icon: Bell }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {id === 'alarms' && data.alarms.filter(a => !a.resolved).length > 0 && (
                  <span className="px-2 py-1 ml-1 text-xs text-white bg-red-500 rounded-full">
                    {data.alarms.filter(a => !a.resolved).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {renderContent()}
      </main>

      {/* Modal for Add/Edit */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={`${modalType === 'add' ? 'Add' : 'Edit'} ${activeTab.slice(0, -1)}`}
      >
        <form onSubmit={handleSubmit}>
          {activeTab === 'vehicles' && (
            <>
              <FormField 
                label="Manufacturer" 
                value={formData.manufacturer || ''} 
                onChange={(e) => handleFormChange('manufacturer', e.target.value)} 
              />
              <FormField 
                label="Model" 
                value={formData.model || ''} 
                onChange={(e) => handleFormChange('model', e.target.value)} 
              />
              <FormField 
                label="Vehicle Number" 
                value={formData.vehicle_number || ''} 
                onChange={(e) => handleFormChange('vehicle_number', e.target.value)} 
              />
              <FormField 
                label="Vehicle Type" 
                value={formData.vehicle_type || ''} 
                onChange={(e) => handleFormChange('vehicle_type', e.target.value)} 
              />
            </>
          )}
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : modalType === 'add' ? 'Add' : 'Update'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;