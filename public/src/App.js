import React, { useState, useEffect } from 'react';
import { Calendar, Plus, User, BarChart3, Bell, LogOut, Save, AlertTriangle, CheckCircle } from 'lucide-react';

// Mock data for demonstration
const mockData = {
  priests: [
    { id: '1', username: 'father.john', name: 'Fr. John Smith', province: 'Northern Province' },
    { id: '2', username: 'father.michael', name: 'Fr. Michael Brown', province: 'Southern Province' }
  ],
  masses: [],
  bulkSeries: [],
  personalMassTracker: []
};

// Login Form Component
const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mass Tracking System</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="father.john"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="password123"
            />
          </div>
          
          <button
            onClick={() => onLogin(username, password)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Sign In
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-500 text-center">
          Demo: father.john / password123
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ currentUser, masses, bulkSeries, personalTracker, notifications }) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentTracker = personalTracker.find(t => 
    t.priestId === currentUser?.id && t.month === currentMonth && t.year === currentYear
  );

  const userMasses = masses.filter(m => m.priestId === currentUser?.id);
  const userBulkSeries = bulkSeries.filter(s => s.assignedPriestId === currentUser?.id);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome, {currentUser?.name}</h2>
        
        {notifications.length > 0 && (
          <div className="mb-4 space-y-2">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 rounded-md flex items-center space-x-2 ${
                  notification.type === 'warning' 
                    ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                    : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}
              >
                {notification.type === 'warning' ? <AlertTriangle size={16} /> : <Bell size={16} />}
                <span className="text-sm">{notification.message}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800">Personal Masses This Month</h3>
            <p className="text-2xl font-bold text-blue-600">
              {currentTracker?.completedCount || 0} / {currentTracker?.requiredCount || 3}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800">Total Masses Celebrated</h3>
            <p className="text-2xl font-bold text-green-600">{userMasses.length}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-800">Active Bulk Series</h3>
            <p className="text-2xl font-bold text-purple-600">
              {userBulkSeries.filter(s => s.isActive).length}
            </p>
          </div>
        </div>
      </div>

      {userBulkSeries.filter(s => s.isActive).map(series => (
        <div key={series.id} className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-2">
            Active Bulk Series: {series.intentionDescription}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Source: {series.source}</p>
              <p className="text-sm text-gray-600">
                Progress: {series.totalMasses - series.remainingMasses} / {series.totalMasses}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{series.remainingMasses}</p>
              <p className="text-sm text-gray-600">remaining</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((series.totalMasses - series.remainingMasses) / series.totalMasses) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Mass Entry Form Component
const MassEntryForm = ({ currentUser, bulkSeries, onAddMass }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    massType: 'personal',
    intentionSource: '',
    intentionDetails: '',
    bulkSeriesId: '',
    isFixedDate: false
  });

  const activeBulkSeries = bulkSeries.filter(s => 
    s.assignedPriestId === currentUser?.id && s.isActive
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let massData = { ...formData };
    
    if (formData.massType.startsWith('bulk_') && formData.bulkSeriesId) {
      const series = activeBulkSeries.find(s => s.id === formData.bulkSeriesId);
      if (series) {
        massData.serialNumber = series.remainingMasses;
        massData.intentionDetails = series.intentionDescription;
      }
    }
    
    onAddMass(massData);
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      massType: 'personal',
      intentionSource: '',
      intentionDetails: '',
      bulkSeriesId: '',
      isFixedDate: false
    });
    
    alert('Mass entry saved successfully!');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Record Mass Celebration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mass Type</label>
            <select
              value={formData.massType}
              onChange={(e) => setFormData({...formData, massType: e.target.value, bulkSeriesId: ''})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="personal">Personal Mass</option>
              <option value="deceased">Deceased Member</option>
              <option value="bulk_province">Bulk - Province Intentions</option>
              <option value="bulk_generalate">Bulk - Generalate Intentions</option>
              <option value="special">Special Occasion</option>
            </select>
          </div>
        </div>

        {(formData.massType === 'bulk_province' || formData.massType === 'bulk_generalate') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Bulk Series</label>
            <select
              value={formData.bulkSeriesId}
              onChange={(e) => setFormData({...formData, bulkSeriesId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a bulk series</option>
              {activeBulkSeries
                .filter(s => s.source === (formData.massType === 'bulk_province' ? 'province' : 'generalate'))
                .map(series => (
                <option key={series.id} value={series.id}>
                  {series.intentionDescription} (remaining: {series.remainingMasses})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Intention Source</label>
          <input
            type="text"
            value={formData.intentionSource}
            onChange={(e) => setFormData({...formData, intentionSource: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Who provided the intention"
            required
          />
        </div>

        {formData.massType !== 'bulk_province' && formData.massType !== 'bulk_generalate' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intention Details</label>
            <textarea
              value={formData.intentionDetails}
              onChange={(e) => setFormData({...formData, intentionDetails: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Details about the mass intention"
              required
            />
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isFixedDate"
            checked={formData.isFixedDate}
            onChange={(e) => setFormData({...formData, isFixedDate: e.target.checked})}
            className="mr-2"
          />
          <label htmlFor="isFixedDate" className="text-sm text-gray-700">
            This is a fixed-date obligation
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2"
        >
          <Save size={16} />
          <span>Record Mass</span>
        </button>
      </form>
    </div>
  );
};

// Bulk Series Manager Component
const BulkSeriesManager = ({ currentUser, bulkSeries, onCreateBulkSeries }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    source: 'province',
    totalMasses: '',
    intentionDescription: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.totalMasses || !formData.intentionDescription.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const totalMasses = parseInt(formData.totalMasses);
    if (isNaN(totalMasses) || totalMasses <= 0) {
      alert('Please enter a valid number of masses');
      return;
    }
    
    onCreateBulkSeries({
      source: formData.source,
      totalMasses: totalMasses,
      intentionDescription: formData.intentionDescription.trim()
    });
    
    setFormData({
      source: 'province',
      totalMasses: '',
      intentionDescription: ''
    });
    setShowForm(false);
    alert('Bulk series created successfully!');
  };

  const userBulkSeries = bulkSeries.filter(s => s.assignedPriestId === currentUser?.id);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Bulk Mass Series</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>New Series</span>
          </button>
        </div>

        {showForm && (
          <div className="border-t pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="province">Province</option>
                    <option value="generalate">Generalate</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Masses</label>
                  <input
                    type="number"
                    value={formData.totalMasses}
                    onChange={(e) => setFormData({...formData, totalMasses: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="1000"
                    placeholder="e.g., 300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intention Description</label>
                <input
                  type="text"
                  value={formData.intentionDescription}
                  onChange={(e) => setFormData({...formData, intentionDescription: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., For deceased members of XYZ Province"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Create Series
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {userBulkSeries.length === 0 && !showForm && (
          <div className="text-center py-8 text-gray-500">
            <p>No bulk series created yet.</p>
            <p>Click "New Series" to create your first bulk mass series.</p>
          </div>
        )}
      </div>

      {userBulkSeries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userBulkSeries.map(series => (
            <div key={series.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{series.intentionDescription}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  series.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {series.isActive ? 'Active' : 'Completed'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>Source: <span className="capitalize">{series.source}</span></p>
                <p>Total: {series.totalMasses} masses</p>
                <p>Remaining: {series.remainingMasses}</p>
                <p>Started: {new Date(series.startDate).toLocaleDateString()}</p>
                {series.lastCelebratedDate && (
                  <p>Last celebrated: {new Date(series.lastCelebratedDate).toLocaleDateString()}</p>
                )}
              </div>

              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((series.totalMasses - series.remainingMasses) / series.totalMasses) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Reports Component
const Reports = ({ currentUser, masses }) => {
  const userMasses = masses.filter(m => m.priestId === currentUser?.id);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const currentMonthMasses = userMasses.filter(m => {
    const massDate = new Date(m.date);
    return massDate.getMonth() + 1 === currentMonth && massDate.getFullYear() === currentYear;
  });

  const massesByType = userMasses.reduce((acc, mass) => {
    acc[mass.massType] = (acc[mass.massType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Mass Celebration Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Current Month Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Masses:</span>
                <span className="font-semibold">{currentMonthMasses.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Personal Masses:</span>
                <span className="font-semibold">
                  {currentMonthMasses.filter(m => m.massType === 'personal').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bulk Masses:</span>
                <span className="font-semibold">
                  {currentMonthMasses.filter(m => m.massType.startsWith('bulk_')).length}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-800 mb-3">All Time Summary</h3>
            <div className="space-y-2">
              {Object.entries(massesByType).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="capitalize">{type.replace('_', ' ')}:</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium text-gray-800 mb-4">Recent Mass Celebrations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Source</th>
                <th className="text-left py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {userMasses
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10)
                .map(mass => (
                <tr key={mass.id} className="border-b">
                  <td className="py-2">{new Date(mass.date).toLocaleDateString()}</td>
                  <td className="py-2 capitalize">{mass.massType.replace('_', ' ')}</td>
                  <td className="py-2">{mass.intentionSource}</td>
                  <td className="py-2 truncate max-w-xs">{mass.intentionDetails}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ currentUser, currentView, setCurrentView, onLogout }) => (
  <div className="bg-white shadow-lg h-screen w-64 fixed left-0 top-0">
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <User size={24} className="text-blue-600" />
        <div>
          <h3 className="font-semibold text-gray-800">{currentUser?.name}</h3>
          <p className="text-sm text-gray-600">{currentUser?.province}</p>
        </div>
      </div>

      <nav className="space-y-2">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
            currentView === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <BarChart3 size={20} />
          <span>Dashboard</span>
        </button>
        
        <button
          onClick={() => setCurrentView('mass-entry')}
          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
            currentView === 'mass-entry' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Plus size={20} />
          <span>Record Mass</span>
        </button>
        
        <button
          onClick={() => setCurrentView('bulk-series
