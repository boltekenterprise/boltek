import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { TrendingDown, TrendingUp, DollarSign, Users, Loader, AlertCircle } from 'lucide-react';

export default function AccountingDashboard() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingPayroll: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'income' | 'payroll'>('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const incomeQ = query(collection(db, 'income_records'), where('status', '==', 'paid'));
      const incomeSnap = await getDocs(incomeQ);
      const totalIncome = incomeSnap.docs.reduce((sum, docSnap) => sum + (docSnap.data().amount || 0), 0);

      const expenseQ = query(collection(db, 'expenses'), where('status', '==', 'paid'));
      const expenseSnap = await getDocs(expenseQ);
      const totalExpenses = expenseSnap.docs.reduce((sum, docSnap) => sum + (docSnap.data().amount || 0), 0);

      const payrollQ = query(collection(db, 'payroll'), where('status', '==', 'pending'));
      const payrollSnap = await getDocs(payrollQ);
      const pendingPayroll = payrollSnap.docs.reduce((sum, docSnap) => sum + (docSnap.data().net_amount || 0), 0);

      setStats({
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        pendingPayroll,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-flame-700 animate-spin mr-2" />
        <span className="text-gray-600">Loading accounting dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-gray-900">Accounting Dashboard</h1>
        <p className="text-gray-600 mt-1">Track expenses, income, VAT, taxes, and wages</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-green-700 uppercase">Total Income</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="font-heading font-black text-2xl text-green-900">
            ₨{(stats.totalIncome / 100000).toFixed(1)}L
          </p>
          <p className="text-xs text-green-700 mt-1">Paid invoices</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-700 uppercase">Total Expenses</span>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="font-heading font-black text-2xl text-red-900">
            ₨{(stats.totalExpenses / 100000).toFixed(1)}L
          </p>
          <p className="text-xs text-red-700 mt-1">Paid expenses</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-700 uppercase">Net Profit</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="font-heading font-black text-2xl text-blue-900">
            ₨{(stats.netProfit / 100000).toFixed(1)}L
          </p>
          <p className="text-xs text-blue-700 mt-1">Income - Expenses</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700 uppercase">Pending Payroll</span>
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <p className="font-heading font-black text-2xl text-amber-900">
            ₨{(stats.pendingPayroll / 100000).toFixed(1)}L
          </p>
          <p className="text-xs text-amber-700 mt-1">To be processed</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'expenses', 'income', 'payroll'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-flame-700 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-flame-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        {activeTab === 'overview' && (
          <div>
            <h2 className="font-heading font-bold text-xl mb-4">Financial Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">YTD Income</p>
                <p className="font-heading font-black text-xl text-green-600">
                  ₨{(stats.totalIncome / 100000).toFixed(2)}L
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">YTD Expenses</p>
                <p className="font-heading font-black text-xl text-red-600">
                  ₨{(stats.totalExpenses / 100000).toFixed(2)}L
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div>
            <h2 className="font-heading font-bold text-xl mb-4">Expense Tracking</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">View and manage all company expenses</p>
            </div>
          </div>
        )}

        {activeTab === 'income' && (
          <div>
            <h2 className="font-heading font-bold text-xl mb-4">Income Records</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">Track sales, services, and other income sources</p>
            </div>
          </div>
        )}

        {activeTab === 'payroll' && (
          <div>
            <h2 className="font-heading font-bold text-xl mb-4">Payroll Management</h2>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-purple-800">Manage employee wages and payroll processing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
