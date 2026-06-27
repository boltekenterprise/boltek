"use client";
import { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SAMPLE_BLOGS } from '../lib/seedData';

interface Blog {
  id: string;
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  createdAt?: any;
}

const EMPTY = {
  title: '', slug: '', category: 'General', excerpt: '', content: '', image: '',
};

export default function BlogManager() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const handleSeedBlogs = async () => {
    setSeeding(true);
    try {
      for (const sample of SAMPLE_BLOGS) {
        await addDoc(collection(db, 'blogs'), {
          ...sample,
          createdAt: serverTimestamp(),
        });
      }
      alert('Fire safety guides seeded successfully!');
      fetchBlogs();
    } catch (err) {
      console.error('Error seeding blogs:', err);
      alert('Failed to seed blogs.');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setBlogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Blog)));
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const makeSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openEdit = (b: Blog) => {
    setEditingId(b.id);
    setForm({ title: b.title || '', slug: b.slug || '', category: b.category || 'General', excerpt: b.excerpt || '', content: b.content || '', image: b.image || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    const s = form.slug || makeSlug(form.title);
    try {
      const payload = { title: form.title.trim(), slug: s, category: form.category.trim(), excerpt: form.excerpt, content: form.content, image: form.image, };
      if (editingId) {
        await updateDoc(doc(db, 'blogs', editingId), payload);
        alert('Blog updated');
      } else {
        await addDoc(collection(db, 'blogs'), { ...payload, createdAt: serverTimestamp() });
        alert('Blog created');
      }
      resetForm();
      fetchBlogs();
    } catch (err) {
      console.error('Error saving blog:', err);
      alert('Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article permanently?')) return;
    try {
      await deleteDoc(doc(db, 'blogs', id));
      fetchBlogs();
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Failed to delete blog');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-gray-900">Blog Manager</h2>
          <p className="text-gray-600 text-sm mt-1">Create, edit and remove blog posts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeedBlogs}
            disabled={seeding}
            className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm transition-all disabled:opacity-50"
          >
            {seeding ? 'Seeding...' : 'Seed Sample Guides'}
          </button>
          <button
            onClick={() => resetForm()}
            className="bg-flame-700 text-white px-3 py-2 rounded-md text-sm"
          >
            New Post
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="font-heading font-bold text-lg mb-4 text-gray-900">{editingId ? 'Edit Article' : 'Create Article'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Slug (optional)</label>
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Excerpt</label>
            <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="w-full border p-2 rounded" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium">Content (HTML)</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full border p-2 rounded" rows={8} />
          </div>
          <div>
            <label className="block text-sm font-medium">Image URL (from DB or assets)</label>
            <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="w-full border p-2 rounded" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-burgundy text-white rounded">
              {saving ? 'Saving…' : editingId ? 'Update Post' : 'Create Post'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="font-heading font-bold text-lg mb-4">Existing Articles</h3>
        {loading ? (
          <div className="py-6 text-center">Loading…</div>
        ) : blogs.length === 0 ? (
          <div className="py-6 text-center text-gray-500">No articles yet.</div>
        ) : (
          <div className="space-y-3">
            {blogs.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {b.image ? <img src={b.image} alt={b.title} className="w-16 h-12 object-cover rounded" /> : <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">No Image</div>}
                  <div>
                    <div className="font-semibold">{b.title}</div>
                    <div className="text-xs text-gray-500">{b.category} — {b.slug}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(b)} className="px-3 py-1 bg-yellow-50 border border-yellow-200 rounded text-sm">Edit</button>
                  <button onClick={() => handleDelete(b.id)} className="px-3 py-1 bg-red-50 border border-red-200 rounded text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
