import React, { useState, useEffect } from 'react';
import { Car, Shield, Bell, User, Plus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';

// Mock data - replace with actual API calls
const mockData = {
  vehicles: [
    { vehicle_id: 1, manager_id: 1, manufacturer: 'Toyota', model: 'Camry', vehicle_number: 'ABC123', vehicle_type: 'Sedan' },
    { vehicle_id: 2, manager_id: 1, manufacturer: 'Honda', model: 'Civic', vehicle_number: 'XYZ789', vehicle_type: 'Sedan' },
    { vehicle_id: 3, manager_id: 2, manufacturer: 'Ford', model: 'F-150', vehicle_number: 'DEF456', vehicle_type: 'Truck' }
  ],
  devices: [
    { device_id: 1, manager_id: 1, vehicle_id: 1, device_name: 'GPS Tracker 1', device_type: 'GPS', status: 'Active', installed_at: '2024-01-15' },
    { device_id: 2, manager_id: 1, vehicle_id: 2, device_name: 'Alarm System 1', device_type: 'Security', status: 'Active', installed_at: '2024-01-20' },
    { device_id: 3, manager_id: 2, vehicle_id: 3, device_name: 'Camera System', device_type: 'Surveillance', status: 'Inactive', installed_at: '2024-02-01' }
  ],
  alarms: [
    { alarm_id: 1, device_id: 1, alarm_time: '2024-06-08 10:30:00', alarm_type: 'Speed Alert', description: 'Vehicle exceeded speed limit', resolved: false },
    { alarm_id: 2, device_id: 2, alarm_time: '2024-06-08 14:15:00', alarm_type: 'Security Breach', description: 'Unauthorized access detected', resolved: true },
    { alarm_id: 3, device_id: 1, alarm_time: '2024-06-08 16:45:00', alarm_type: 'GPS Signal Lost', description: 'GPS signal interrupted', resolved: false }
  ],
  managers: [
    { manager_id: 1, name: 'John Smith', email: 'john@company.com', phone_number: '+1-555-0101', password: '***' },
    { manager_id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', phone_number: '+1-555-0102', password: '***' }
  ]
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(mockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add' or 'edit'

  // API base URL - replace with your actual API URL
  const API_BASE = 'http://164.52.194.198:9090/api';

  // Simulate API calls - replace with actual fetch calls
  const fetchData = async () => {
    // Example API calls you would make:
    // const vehicles = await fetch(`${API_BASE}/vehicles`).then(r => r.json());
    // const devices = await fetch(`${API_BASE}/devices`).then(r => r.json());
    // const alarms = await fetch(`${API_BASE}/alarms`).then(r => r.json());
    // const managers = await fetch(`${API_BASE}/managers`).then(r => r.json());
    
    // For now, using mock data
    setData(mockData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalType('');
  };

  const handleSubmit = async (formData) => {
    // Here you would make API calls to create/update data
    console.log('Submitting:', formData);
    closeModal();
    fetchData(); // Refresh data
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      // API call to delete item
      console.log(`Deleting ${type} with id:`, id);
      fetchData(); // Refresh data
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: color }}>
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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={() => onAdd()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {Object.values(row).map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cell}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Vehicles" value={data.vehicles.length} icon={Car} color="#3B82F6" />
        <StatCard title="Active Devices" value={data.devices.filter(d => d.status === 'Active').length} icon={Shield} color="#10B981" />
        <StatCard title="Active Alarms" value={data.alarms.filter(a => !a.resolved).length} icon={Bell} color="#EF4444" />
        <StatCard title="Managers" value={data.managers.length} icon={User} color="#8B5CF6" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recent Alarms</h3>
          <div className="space-y-3">
            {data.alarms.slice(0, 5).map((alarm) => (
              <div key={alarm.alarm_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{alarm.alarm_type}</p>
                  <p className="text-xs text-gray-600">{alarm.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${alarm.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {alarm.resolved ? 'Resolved' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Device Status</h3>
          <div className="space-y-3">
            {data.devices.map((device) => (
              <div key={device.device_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{device.device_name}</p>
                  <p className="text-xs text-gray-600">{device.device_type}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${device.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {device.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'vehicles':
        return (
          <DataTable
            title="Vehicles"
            headers={['ID', 'Manager ID', 'Manufacturer', 'Model', 'Number', 'Type']}
            rows={data.vehicles}
            onAdd={() => openModal('add', 'vehicle')}
            onEdit={(item) => openModal('edit', item)}
            onDelete={(id) => handleDelete('vehicle', id)}
          />
        );
      case 'devices':
        return (
          <DataTable
            title="Devices"
            headers={['ID', 'Manager ID', 'Vehicle ID', 'Name', 'Type', 'Status', 'Installed']}
            rows={data.devices}
            onAdd={() => openModal('add', 'device')}
            onEdit={(item) => openModal('edit', item)}
            onDelete={(id) => handleDelete('device', id)}
          />
        );
      case 'alarms':
        return (
          <DataTable
            title="Alarms"
            headers={['ID', 'Device ID', 'Time', 'Type', 'Description', 'Resolved']}
            rows={data.alarms.map(alarm => ({
              ...alarm,
              resolved: alarm.resolved ? 'Yes' : 'No'
            }))}
            onAdd={() => openModal('add', 'alarm')}
            onEdit={(item) => openModal('edit', item)}
            onDelete={(id) => handleDelete('alarm', id)}
          />
        );
      case 'managers':
        return (
          <DataTable
            title="Managers"
            headers={['ID', 'Name', 'Email', 'Phone', 'Password']}
            rows={data.managers}
            onAdd={() => openModal('add', 'manager')}
            onEdit={(item) => openModal('edit', item)}
            onDelete={(id) => handleDelete('manager', id)}
          />
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Management Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={fetchData}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Shield },
              { id: 'vehicles', label: 'Vehicles', icon: Car },
              { id: 'devices', label: 'Devices', icon: Shield },
              { id: 'alarms', label: 'Alarms', icon: Bell },
              { id: 'managers', label: 'Managers', icon: User }
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
        <div>
          {/* Dynamic form fields based on active tab */}
          {activeTab === 'vehicles' && (
            <>
              <FormField label="Manager ID" />
              <FormField label="Manufacturer" />
              <FormField label="Model" />
              <FormField label="Vehicle Number" />
              <FormField label="Vehicle Type" />
            </>
          )}
          {activeTab === 'devices' && (
            <>
              <FormField label="Manager ID" />
              <FormField label="Vehicle ID" />
              <FormField label="Device Name" />
              <FormField label="Device Type" />
              <FormField 
                label="Status" 
                type="select"
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' }
                ]}
              />
              <FormField label="Installed At" type="date" />
            </>
          )}
          {activeTab === 'managers' && (
            <>
              <FormField label="Name" />
              <FormField label="Email" type="email" />
              <FormField label="Phone Number" />
              <FormField label="Password" type="password" />
            </>
          )}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => handleSubmit({})}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              {modalType === 'add' ? 'Add' : 'Update'}
            </button>
            <button
              onClick={closeModal}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;