import { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Plus, Trash2, Loader, Image as ImageIcon, Link as LinkIcon, ShoppingBag, Edit, Check } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  category: string;
  price?: string;
  image: string;
  details: string;
  specs: string;
  howToUse: string;
  essay: string;
  createdAt?: unknown;
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Fire Extinguishers',
    price: '',
    details: '',
    specs: '',
    howToUse: '',
    essay: '',
    imageFile: null as File | null,
    imageUrl: '',
  });

  const categories = [
    'Fire Extinguishers',
    'Signages',
    'Alarms & Detectors',
    'Hose Reels & Valves',
    'Safety Gear',
    'Other',
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'shop_products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Product));
      setProducts(data);
    } catch (err) {
      console.error('Error fetching shop products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, imageFile: e.target.files[0] });
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      category: 'Fire Extinguishers',
      price: '',
      details: '',
      specs: '',
      howToUse: '',
      essay: '',
      imageFile: null,
      imageUrl: '',
    });
    setEditingId(null);
    setUploadProgress(0);
  };

  const handleEdit = (product: Product) => {
    setForm({
      title: product.title,
      category: product.category,
      price: product.price || '',
      details: product.details || '',
      specs: product.specs || '',
      howToUse: product.howToUse || '',
      essay: product.essay || '',
      imageFile: null,
      imageUrl: product.image || '',
    });
    setImageMode('url');
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.category || !form.details) {
      alert('Please fill in required fields (Title, Category, Details)');
      return;
    }

    let finalImageUrl = form.imageUrl;

    try {
      setUploading(true);

      // Handle Image File Upload if in upload mode and a file is selected
      if (imageMode === 'upload' && form.imageFile) {
        const file = form.imageFile;
        const fileRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        finalImageUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            },
            (error) => {
              console.error('Upload failed:', error);
              reject(error);
            },
            async () => {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            }
          );
        });
      }

      if (!finalImageUrl) {
        // Use a generic placeholder if no image was supplied
        finalImageUrl = 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400';
      }

      const productData = {
        title: form.title,
        category: form.category,
        price: form.price,
        details: form.details,
        specs: form.specs,
        howToUse: form.howToUse,
        essay: form.essay,
        image: finalImageUrl,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        // Edit existing product
        const docRef = doc(db, 'shop_products', editingId);
        await updateDoc(docRef, productData);
      } else {
        // Add new product
        const colRef = collection(db, 'shop_products');
        await addDoc(colRef, {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Please check your Firestore rules and Firebase Storage settings.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'shop_products', id));
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 admin-theme">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-flame-700" />
            Shop Products Manager
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage your fire safety products, specifications, and educational essays.
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-flame-700 hover:bg-flame-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {showForm ? 'Cancel' : (
            <>
              <Plus className="w-4 h-4" />
              Add Product
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-150 space-y-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-flame-500 focus:border-flame-500"
                placeholder="Co2 Fire Extinguisher 2kg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-flame-500 focus:border-flame-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Optional)</label>
              <input
                type="text"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-flame-500 focus:border-flame-500"
                placeholder="e.g. Rs. 4,500 / Contact for Quote"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Sourcing</label>
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                    imageMode === 'upload'
                      ? 'bg-flame-50 text-flame-700 border-flame-200'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                    imageMode === 'url'
                      ? 'bg-flame-50 text-flame-700 border-flame-200'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  Image URL
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            {imageMode === 'upload' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-flame-50 file:text-flame-700 hover:file:bg-flame-100"
                />
                {uploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-flame-600 h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">Uploading image: {uploadProgress}%</span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-flame-500 focus:border-flame-500"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Details / Brief Overview *</label>
            <textarea
              required
              rows={3}
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-flame-500 focus:border-flame-500"
              placeholder="Provide a brief summary of the product. This will appear on the shop card."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Specifications (One per line)</label>
            <textarea
              rows={4}
              value={form.specs}
              onChange={(e) => setForm({ ...form, specs: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-flame-500 focus:border-flame-500 font-mono text-xs"
              placeholder="Capacity: 2kg&#10;Working Pressure: 15 Bar&#10;Test Pressure: 250 Bar&#10;Material: Mild Steel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How To Use Instructions</label>
            <textarea
              rows={4}
              value={form.howToUse}
              onChange={(e) => setForm({ ...form, howToUse: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-flame-500 focus:border-flame-500"
              placeholder="Step-by-step instructions on how to install or operate this product."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Essay / Full Guide (Up to 1800 words)</label>
            <textarea
              rows={10}
              value={form.essay}
              onChange={(e) => setForm({ ...form, essay: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-flame-500 focus:border-flame-500 leading-relaxed"
              placeholder="Write a comprehensive guide, safety standards compliance details, maintenance intervals, testing methodologies, and in-depth educational material about the product."
            />
            {form.essay && (
              <span className="text-[10px] text-gray-500 mt-1 block">
                Word count: {form.essay.trim().split(/\s+/).filter(Boolean).length}
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-flame-700 hover:bg-flame-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {editingId ? 'Update Product' : 'Add Product'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12">
          <Loader className="w-8 h-8 text-flame-700 animate-spin mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Loading products catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm font-medium">No products registered yet</p>
          <p className="text-gray-400 text-xs mt-1">Click the "Add Product" button above to list your first item.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-3 px-4 font-semibold text-gray-700">Image</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Product details</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Price</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-gray-900 block">{product.title}</span>
                    <span className="text-xs text-gray-500 line-clamp-1 max-w-sm mt-0.5">
                      {product.details}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {product.price || <span className="text-gray-400 text-xs italic">Not Set</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 text-gray-600 hover:text-flame-700 hover:bg-gray-100 rounded transition-all"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
