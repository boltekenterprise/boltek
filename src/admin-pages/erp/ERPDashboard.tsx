import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';
import { BarChart3, Loader } from 'lucide-react';

export default function ERPDashboard() {
  const [stats, setStats] = useState({
    items: 0,
    sales: 0,
    invoices: 0,
    purchases: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [itemsRes, soRes, invRes, poRes] = await Promise.all([
        getCountFromServer(collection(db, 'items')),
        getCountFromServer(collection(db, 'sales_orders')),
        getCountFromServer(collection(db, 'invoices')),
        getCountFromServer(collection(db, 'purchase_orders')),
      ]);

      setStats({
        items: itemsRes.data().count,
        sales: soRes.data().count,
        invoices: invRes.data().count,
        purchases: poRes.data().count,
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
        <span className="text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div>
        <h2 className="font-heading font-bold text-2xl text-gray-900 mb-4">ERP Dashboard</h2>
        <p className="text-gray-600">Manage your complete business operations in one place</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Items
            </span>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="font-heading font-black text-3xl text-blue-900">{stats.items}</p>
          <p className="text-xs text-blue-700 mt-1">Products & Services</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
              Sales Orders
            </span>
            <ShoppingCart className="w-5 h-5 text-green-600" />
          </div>
          <p className="font-heading font-black text-3xl text-green-900">{stats.sales}</p>
          <p className="text-xs text-green-700 mt-1">Total Orders</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Invoices
            </span>
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <p className="font-heading font-black text-3xl text-amber-900">{stats.invoices}</p>
          <p className="text-xs text-amber-700 mt-1">Billing</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
              Purchase Orders
            </span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="font-heading font-black text-3xl text-purple-900">{stats.purchases}</p>
          <p className="text-xs text-purple-700 mt-1">Purchasing</p>
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-gradient-to-r from-flame-50 to-orange-50 rounded-xl p-6 border border-flame-200">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-6 h-6 text-flame-700 flex-shrink-0" />
          <div>
            <h3 className="font-heading font-bold text-flame-900 mb-1">Welcome to ERP</h3>
            <p className="text-sm text-flame-800">
              Your complete business management system is ready. Manage inventory, track sales orders,
              process invoices, and handle purchases all from here. Start by creating your first item
              in the Inventory module.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <h4 className="font-heading font-bold text-gray-900 mb-2">Inventory Management</h4>
          <p className="text-sm text-gray-600">
            Create and manage products, services, and materials. Track stock levels and costs.
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <h4 className="font-heading font-bold text-gray-900 mb-2">Sales Orders</h4>
          <p className="text-sm text-gray-600">
            Create quotations, convert to sales orders, and track fulfillment.
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <h4 className="font-heading font-bold text-gray-900 mb-2">Purchase Orders</h4>
          <p className="text-sm text-gray-600">
            Manage vendor relationships, create POs, and track receiving.
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <h4 className="font-heading font-bold text-gray-900 mb-2">Accounting & Invoicing</h4>
          <p className="text-sm text-gray-600">
            Generate invoices, track payments, and manage financial records.
          </p>
        </div>
      </div>
    </div>
  );
}

// Icons
function Package(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function ShoppingCart(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function DollarSign(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 17" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
