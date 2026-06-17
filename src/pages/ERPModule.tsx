import { useState } from 'react';
import { BarChart3, Package, ShoppingCart, DollarSign, TrendingUp, Settings } from 'lucide-react';
import InventoryModule from './erp/InventoryModule';
import PurchasingModule from './erp/PurchasingModule';
import SalesModule from './erp/SalesModule';
import AccountingModule from './erp/AccountingModule';
import ERPDashboard from './erp/ERPDashboard';

type ModuleType = 'dashboard' | 'inventory' | 'purchasing' | 'sales' | 'accounting' | 'settings';

const modules = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'purchasing', label: 'Purchasing', icon: TrendingUp },
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'accounting', label: 'Accounting', icon: DollarSign },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ERPModule() {
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');

  return (
    <div className="space-y-6">
      {/* Module Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id as ModuleType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-flame-700 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-flame-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {mod.label}
            </button>
          );
        })}
      </div>

      {/* Module Content */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        {activeModule === 'dashboard' && <ERPDashboard />}
        {activeModule === 'inventory' && <InventoryModule />}
        {activeModule === 'purchasing' && <PurchasingModule />}
        {activeModule === 'sales' && <SalesModule />}
        {activeModule === 'accounting' && <AccountingModule />}
        {activeModule === 'settings' && <div className="text-gray-600">Settings module coming soon</div>}
      </div>
    </div>
  );
}
