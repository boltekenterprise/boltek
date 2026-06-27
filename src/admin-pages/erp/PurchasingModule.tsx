import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { Plus, AlertCircle, Loader } from 'lucide-react';

interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id: string;
  po_date: string;
  items: any[];
  total_amount: number;
  status: string;
}

export default function PurchasingModule() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    po_number: `PO-${Date.now()}`,
    vendor_name: '',
    items: [] as any[],
    total_amount: 0,
    status: 'draft',
  });

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const q = query(collection(db, 'purchase_orders'), orderBy('po_date', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as PurchaseOrder));
      setPurchaseOrders(data);
    } catch (err) {
      console.error('Error fetching POs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'purchase_orders'), {
        ...form,
        po_date: new Date().toISOString().split('T')[0],
      });

      setForm({
        po_number: `PO-${Date.now()}`,
        vendor_name: '',
        items: [],
        total_amount: 0,
        status: 'draft',
      });
      setShowForm(false);
      fetchPurchaseOrders();
    } catch (err) {
      console.error('Error creating PO:', err);
      alert('Error creating purchase order');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-flame-700 animate-spin mr-2" />
        <span className="text-gray-600">Loading purchase orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-gray-900">Purchase Orders</h2>
          <p className="text-gray-600 text-sm mt-1">{purchaseOrders.length} purchase orders</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-flame-700 hover:bg-flame-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New PO
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="font-heading font-bold text-lg mb-4">Create Purchase Order</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                <input
                  type="text"
                  value={form.po_number}
                  onChange={(e) => setForm({ ...form, po_number: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  value={form.vendor_name}
                  onChange={(e) => setForm({ ...form, vendor_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount (₨)
                </label>
                <input
                  type="number"
                  value={form.total_amount}
                  onChange={(e) => setForm({ ...form, total_amount: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="received">Received</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-flame-700 hover:bg-flame-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Create PO
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {purchaseOrders.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No purchase orders yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">PO Number</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Vendor</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-900">{po.po_number}</td>
                  <td className="px-4 py-3 text-gray-600">Vendor {po.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-gray-600">{po.po_date}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ₨{po.total_amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        po.status === 'draft'
                          ? 'bg-gray-100 text-gray-700'
                          : po.status === 'submitted'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
