import { useState } from 'react';
import { AlertCircle, Users } from 'lucide-react';

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-black text-3xl text-gray-900">HR Management</h1>
        <p className="text-gray-600 mt-1">Manage employees, wages, project assignments, and records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading font-bold text-purple-900">Total Employees</h3>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="font-heading font-black text-3xl text-purple-900">0</p>
          <p className="text-sm text-purple-700 mt-2">Active</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <h3 className="font-heading font-bold text-blue-900 mb-2">Monthly Payroll</h3>
          <p className="font-heading font-black text-3xl text-blue-900">₨0</p>
          <p className="text-sm text-blue-700 mt-2">Pending</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <h3 className="font-heading font-bold text-green-900 mb-2">Project Assignments</h3>
          <p className="font-heading font-black text-3xl text-green-900">0</p>
          <p className="text-sm text-green-700 mt-2">Active</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['employees', 'payroll', 'assignments', 'records'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-flame-700 text-white'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-heading font-bold text-xl mb-4">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h2>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600" />
          <p className="text-sm text-purple-800">
            {activeTab === 'employees' && 'Manage employee records and information'}
            {activeTab === 'payroll' && 'Process and track employee wages'}
            {activeTab === 'assignments' && 'Assign employees to projects'}
            {activeTab === 'records' && 'View attendance and performance records'}
          </p>
        </div>
      </div>
    </div>
  );
}
