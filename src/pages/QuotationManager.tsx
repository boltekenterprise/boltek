import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Plus, Edit2, Trash2, DollarSign, CheckCircle, AlertCircle, Loader, Link2, Zap } from 'lucide-react';

interface Quotation {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  building_type: string;
  services: any[];
  location: string;
  total_amount: number;
  description: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  erpnext_id?: string;
  erpnext_synced_at?: string;
  created_at: string;
}

const serviceList = [
  { name: 'Fire Hydrant System', price: 50000 },
  { name: 'Fire Sprinkler System', price: 45000 },
  { name: 'Fire Alarm System', price: 35000 },
  { name: 'Fire Suppression System', price: 60000 },
  { name: 'Annual Maintenance Contract', price: 20000 },
  { name: 'Fire Safety Training', price: 15000 },
  { name: 'Fire Risk Assessment', price: 25000 },
];

const buildingTypes = ['Hotel', 'Hospital', 'Commercial', 'Industrial', 'Office', 'Residential'];

export default function QuotationManager() {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [erpnextAvailable, setErpnextAvailable] = useState(false);

  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    building_type: '',
    location: '',
    description: '',
    services: [] as string[],
    status: 'draft' as 'draft' | 'sent' | 'accepted' | 'rejected',
  });

  useEffect(() => {
    fetchQuotations();
    checkERPNextConnection();
  }, [user]);

  const checkERPNextConnection = async () => {
    // TODO: Migrate ERPNext check to Firebase Cloud Functions
    setErpnextAvailable(false);
  };

  const fetchQuotations = async () => {
    try {
      const q = query(collection(db, 'quotations'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Quotation));
      setQuotations(data);
    } catch (err) {
      console.error('Error fetching quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return form.services.reduce((sum, serviceName) => {
      const service = serviceList.find((s) => s.name === serviceName);
      return sum + (service?.price || 0);
    }, 0);
  };

  const syncToERPNext = async (quotation: Quotation) => {
    setSyncingId(quotation.id);
    try {
      // TODO: Migrate ERPNext sync to Firebase Cloud Functions
      throw new Error('ERPNext sync requires Firebase Cloud Functions migration');
    } catch (err) {
      console.error('Sync error:', err);
      setSuccessMsg(`✗ Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.client_name ||
      !form.client_email ||
      !form.building_type ||
      form.services.length === 0
    ) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const total = calculateTotal();
      const quotationData = {
        client_name: form.client_name,
        client_email: form.client_email,
        client_phone: form.client_phone,
        building_type: form.building_type,
        location: form.location,
        description: form.description,
        services: form.services.map((name) => ({
          name,
          price: serviceList.find((s) => s.name === name)?.price || 0,
        })),
        total_amount: total,
        status: form.status,
      };

      if (editingId) {
        await updateDoc(doc(db, 'quotations', editingId), quotationData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'quotations'), {
          ...quotationData,
          created_at: new Date().toISOString()
        });
      }

      setSuccessMsg(
        editingId ? 'Quotation updated successfully!' : 'Quotation created successfully!'
      );
      setTimeout(() => setSuccessMsg(''), 3000);

      setForm({
        client_name: '',
        client_email: '',
        client_phone: '',
        building_type: '',
        location: '',
        description: '',
        services: [],
        status: 'draft',
      });
      setShowForm(false);
      fetchQuotations();
    } catch (err) {
      console.error('Error saving quotation:', err);
      alert('Error saving quotation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quotation?')) return;

    try {
      await deleteDoc(doc(db, 'quotations', id));
      setSuccessMsg('Quotation deleted');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchQuotations();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-flame-700 animate-spin mr-2" />
        <span className="text-gray-600">Loading quotations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-3xl text-gray-900">Quotations</h1>
          <p className="text-gray-600 text-sm mt-1">
            {quotations.length} quotations • {erpnextAvailable && '✓ ERPNext Connected'}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
          }}
          className="flex items-center gap-2 bg-flame-700 hover:bg-flame-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Quotation
        </button>
      </div>

      {/* ERPNext Status */}
      {!erpnextAvailable && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-700 text-sm">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">ERPNext Not Connected</p>
            <p className="text-xs mt-0.5">Configure ERPNext credentials to enable sync. See ERPNEXT_SETUP.md</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMsg && (
        <div
          className={`p-4 border rounded-lg flex items-center gap-2 text-sm ${
            successMsg.startsWith('✓')
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-heading font-bold text-xl mb-4">
            {editingId ? 'Edit Quotation' : 'Create New Quotation'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.client_email}
                  onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.client_phone}
                  onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building Type *
                </label>
                <select
                  value={form.building_type}
                  onChange={(e) => setForm({ ...form, building_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100 bg-white"
                >
                  <option value="">Select type...</option>
                  {buildingTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g., Kathmandu"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {serviceList.map((service) => (
                    <label
                      key={service.name}
                      className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-flame-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.services.includes(service.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({
                              ...form,
                              services: [...form.services, service.name],
                            });
                          } else {
                            setForm({
                              ...form,
                              services: form.services.filter((s) => s !== service.name),
                            });
                          }
                        }}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">{service.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">₨{service.price.toLocaleString()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100 bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="bg-flame-50 border border-flame-200 rounded-lg p-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-flame-700" />
                <div>
                  <p className="text-xs text-flame-600">Total Amount</p>
                  <p className="font-heading font-black text-lg text-flame-900">
                    ₨{calculateTotal().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-flame-700 hover:bg-flame-600 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                {editingId ? 'Update Quotation' : 'Create Quotation'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {quotations.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No quotations yet</p>
          </div>
        ) : (
          quotations.map((q) => (
            <div
              key={q.id}
              className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{q.client_name}</h3>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        q.status === 'draft'
                          ? 'bg-gray-100 text-gray-600'
                          : q.status === 'sent'
                          ? 'bg-blue-100 text-blue-700'
                          : q.status === 'accepted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                    </span>
                    {q.erpnext_id && (
                      <span className="text-xs font-medium px-2 py-1 rounded bg-purple-100 text-purple-700 flex items-center gap-1">
                        <Link2 className="w-3 h-3" />
                        {q.erpnext_id}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {q.building_type} • {q.location}
                  </p>
                  <p className="text-xs text-gray-500">
                    {q.services.length} services • ₨{q.total_amount.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-flame-700">
                    ₨{q.total_amount.toLocaleString()}
                  </span>
                  {erpnextAvailable && q.status === 'sent' && !q.erpnext_id && (
                    <button
                      onClick={() => syncToERPNext(q)}
                      disabled={syncingId === q.id}
                      className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors disabled:opacity-50"
                      title="Sync to ERPNext"
                    >
                      {syncingId === q.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingId(q.id);
                      setShowForm(true);
                      setForm({
                        client_name: q.client_name,
                        client_email: q.client_email,
                        client_phone: q.client_phone,
                        building_type: q.building_type,
                        location: q.location,
                        description: q.description,
                        services: q.services.map((s) => s.name),
                        status: q.status,
                      });
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
