import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { Plus, Trash2, AlertCircle, Loader, Search } from 'lucide-react';

interface Item {
  id: string;
  item_code: string;
  item_name: string;
  category: string;
  selling_price: number;
  cost_price: number;
  unit_of_measure: string;
  is_active: boolean;
}

export default function InventoryModule() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    item_code: '',
    item_name: '',
    category: '',
    selling_price: 0,
    cost_price: 0,
    unit_of_measure: 'Nos',
    description: '',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const q = query(
        collection(db, 'items'),
        where('is_active', '==', true),
        orderBy('item_name')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Item));
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.item_code || !form.item_name) {
      alert('Item code and name are required');
      return;
    }

    try {
      await addDoc(collection(db, 'items'), {
        ...form,
        is_active: true,
      });

      setSuccessMsg('Item created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setForm({
        item_code: '',
        item_name: '',
        category: '',
        selling_price: 0,
        cost_price: 0,
        unit_of_measure: 'Nos',
        description: '',
      });
      setShowForm(false);
      fetchItems();
    } catch (err) {
      console.error('Error creating item:', err);
      alert('Error creating item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;

    try {
      await updateDoc(doc(db, 'items', id), { is_active: false });
      setSuccessMsg('Item deleted');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchItems();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const filtered = items.filter(
    (item) =>
      item.item_name.toLowerCase().includes(search.toLowerCase()) ||
      item.item_code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-flame-700 animate-spin mr-2" />
        <span className="text-gray-600">Loading inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-gray-900">Inventory</h2>
          <p className="text-gray-600 text-sm mt-1">{items.length} items</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-flame-700 hover:bg-flame-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Item
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {successMsg}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100"
        />
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="font-heading font-bold text-lg mb-4">Add New Item</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Code *
                </label>
                <input
                  type="text"
                  value={form.item_code}
                  onChange={(e) => setForm({ ...form, item_code: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={form.item_name}
                  onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g., Fire Protection"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
                <select
                  value={form.unit_of_measure}
                  onChange={(e) => setForm({ ...form, unit_of_measure: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 bg-white"
                >
                  <option>Nos</option>
                  <option>Pcs</option>
                  <option>Kg</option>
                  <option>Meter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price (₨)
                </label>
                <input
                  type="number"
                  value={form.cost_price}
                  onChange={(e) => setForm({ ...form, cost_price: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (₨)
                </label>
                <input
                  type="number"
                  value={form.selling_price}
                  onChange={(e) => setForm({ ...form, selling_price: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-flame-700 hover:bg-flame-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Create Item
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

      {/* Items List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">{search ? 'No items found' : 'No items yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Item Code</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Category</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Cost</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Price</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-900">{item.item_code}</td>
                    <td className="px-4 py-3 text-gray-900">{item.item_name}</td>
                    <td className="px-4 py-3 text-gray-600">{item.category || '-'}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      ₨{item.cost_price?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ₨{item.selling_price?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
