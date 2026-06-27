"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LogOut, AlertCircle, Loader, FileText, ListTodo, Settings, BarChart3, Briefcase, ShoppingBag, BookOpen } from 'lucide-react';
import BlogManager from './BlogManager';
import QuotationManager from './QuotationManager';
import TaskManager from './TaskManager';
import ERPModule from './ERPModule';
import RoleBasedDashboard from './RoleBasedDashboard';
import PortfolioManager from './PortfolioManager';
import ProductManager from './ProductManager';

type TabType = 'dashboard' | 'quotations' | 'tasks' | 'erp' | 'portfolio' | 'blogs' | 'products';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'quotations', label: 'Quotations', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'erp', label: 'ERP System', icon: Settings },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'blogs', label: 'Blogs', icon: BookOpen },
  { id: 'products', label: 'Shop Products', icon: ShoppingBag },
];

export default function JobPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      checkAuthorization();
    }
  }, [user]);

  const checkAuthorization = async () => {
    try {
      if (!user?.uid) return;
      const docRef = doc(db, 'admin_users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().role === 'admin') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (err) {
      console.error('Authorization check failed:', err);
      setIsAuthorized(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center admin-theme">
        <div className="text-center p-6 bg-white rounded-xl border shadow-sm max-w-sm w-full mx-4">
          <Loader className="w-8 h-8 text-flame-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-750 font-medium mb-1">Verifying admin access...</p>
          <p className="text-gray-500 text-xs mb-6">Checking credentials on Firestore</p>
          <button
            onClick={handleLogout}
            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-2 rounded text-xs font-semibold border border-stone-200 transition-colors"
          >
            Cancel & Logout
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center p-4 admin-theme">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="font-heading font-bold text-xl text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              Your account is not authorized to access this portal.
            </p>
            <button
              onClick={handleLogout}
              className="w-full bg-flame-700 hover:bg-flame-600 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
            >
              Sign In With Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 admin-theme">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-flame-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-heading font-black text-sm">BK</span>
              </div>
              <div>
                <span className="font-heading font-bold text-gray-900 block">Admin Portal</span>
                <span className="text-xs text-gray-500">{user?.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-flame-700 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-flame-50 text-flame-700 border border-flame-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <RoleBasedDashboard />}
        {activeTab === 'quotations' && <QuotationManager />}
        {activeTab === 'tasks' && <TaskManager />}
        {activeTab === 'erp' && <ERPModule />}
        {activeTab === 'portfolio' && <PortfolioManager />}
        {activeTab === 'blogs' && <BlogManager />}
        {activeTab === 'products' && <ProductManager />}
      </main>
    </div>
  );
}
