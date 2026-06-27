"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
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
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const { user, logout, sendVerificationEmail } = useAuth();

  useEffect(() => {
    if (user) {
      checkAuthorization();
    }
  }, [user]);

  const checkAuthorization = async () => {
    if (user) {
      // Reload user object to get the latest emailVerified value
      try {
        await user.reload();
      } catch (err) {
        console.error('Error reloading user status:', err);
      }
      if (user.emailVerified) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleResendVerification = async () => {
    setVerificationSending(true);
    setVerificationMessage('');
    setVerificationError('');
    try {
      await sendVerificationEmail();
      setVerificationMessage('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setVerificationError(err.message || 'Failed to send verification email.');
    } finally {
      setVerificationSending(false);
    }
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center admin-theme">
        <div className="text-center p-6 bg-white rounded-xl border shadow-sm max-w-sm w-full mx-4">
          <Loader className="w-8 h-8 text-flame-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-750 font-medium mb-1">Verifying admin access...</p>
          <p className="text-gray-500 text-xs mb-6">Checking email verification status</p>
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
              Email Verification Required
            </h1>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Your account is registered, but your email has not been verified yet. Please click the link sent to your email to verify your address.
            </p>

            {verificationMessage && (
              <p className="text-green-600 text-xs font-semibold mb-4 bg-green-50 p-2.5 rounded border border-green-100">
                {verificationMessage}
              </p>
            )}

            {verificationError && (
              <p className="text-red-600 text-xs font-semibold mb-4 bg-red-50 p-2.5 rounded border border-red-100">
                {verificationError}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={checkAuthorization}
                className="w-full bg-flame-700 hover:bg-flame-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                I have verified my email (Check Status)
              </button>
              
              <button
                onClick={handleResendVerification}
                disabled={verificationSending}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {verificationSending ? 'Sending...' : 'Resend Verification Email'}
              </button>

              <button
                onClick={handleLogout}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-lg text-sm font-semibold transition-colors border border-stone-200"
              >
                Sign In With Different Account
              </button>
            </div>
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
