import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function ProjectManagerDashboard() {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-black text-3xl text-gray-900">Project Management</h1>
        <p className="text-gray-600 mt-1">Track projects, quotations, site supervisors, and vendors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <h3 className="font-heading font-bold text-blue-900 mb-2">Active Projects</h3>
          <p className="font-heading font-black text-3xl text-blue-900">0</p>
          <p className="text-sm text-blue-700 mt-2">In progress</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <h3 className="font-heading font-bold text-green-900 mb-2">Completed</h3>
          <p className="font-heading font-black text-3xl text-green-900">0</p>
          <p className="text-sm text-green-700 mt-2">This month</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <h3 className="font-heading font-bold text-amber-900 mb-2">Budget vs Actual</h3>
          <p className="font-heading font-black text-3xl text-amber-900">₨0</p>
          <p className="text-sm text-amber-700 mt-2">Pending review</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['projects', 'quotations', 'vendors', 'supervisors'].map((tab) => (
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

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-800">
            {activeTab === 'projects' && 'Create and track all fire safety projects'}
            {activeTab === 'quotations' && 'Manage quotations and proposals'}
            {activeTab === 'vendors' && 'Manage vendors and suppliers'}
            {activeTab === 'supervisors' && 'Assign and track site supervisors'}
          </p>
        </div>
      </div>
    </div>
  );
}
