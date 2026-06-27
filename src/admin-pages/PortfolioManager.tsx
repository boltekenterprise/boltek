"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { db, storage } from '../lib/firebase';
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  query, orderBy, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  Plus, Trash2, Loader, Image as ImageIcon, Link as LinkIcon,
  ExternalLink, Star, Pencil, X, CheckCircle2,
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  client: string;
  contractor: string;
  date: string;
  category: string;
  type: string;
  image: string;       // legacy single-image field (kept for backward compat)
  images: string[];    // new multi-image field
  featured?: boolean;
  createdAt?: unknown;
}

const EMPTY_FORM = {
  title: '',
  client: '',
  contractor: '',
  date: '',
  category: 'installation',
  type: 'Commercial',
  featured: false,
  imageFiles: [] as File[],
  imageUrl: '',
  existingImages: [] as string[], // already-uploaded URLs (edit mode)
};

export default function PortfolioManager() {
  const [projects, setProjects]         = useState<Project[]>([]);
  const [loading, setLoading]           = useState(true);
  const [uploading, setUploading]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showForm, setShowForm]         = useState(false);
  const [imageMode, setImageMode]       = useState<'upload' | 'url'>('upload');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm]                 = useState({ ...EMPTY_FORM });

  useEffect(() => { fetchProjects(); }, []);

  // ── helpers ────────────────────────────────────────────────────────────────

  const getProjectImages = (p: Project): string[] => {
    if (p.images && Array.isArray(p.images) && p.images.length > 0) return p.images;
    if (p.image) return [p.image];
    return [];
  };

  const fetchProjects = useCallback(async () => {
    try {
      const q = query(collection(db, 'portfolio_projects'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // use centralized browser compression helper (70% quality)
  import('../lib/imageCompress').then(() => {
    // noop: dynamic import to satisfy bundler in this module scope
  }).catch(() => {});

  const compressImage = async (file: File): Promise<File> => {
    try {
      const mod = await import('../lib/imageCompress');
      return await mod.compressImage(file, 0.7, 1200);
    } catch (err) {
      console.warn('Compression failed, using original file', err);
      return file;
    }
  };

  /** Upload an array of File objects and return their download URLs */
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = await compressImage(files[i]);
      const fileRef = ref(storage, `portfolio/${Date.now()}_${file.name}`);
      const task = uploadBytesResumable(fileRef, file);
      const url = await new Promise<string>((resolve, reject) => {
        task.on(
          'state_changed',
          snap => {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            // show aggregate progress across files
            setUploadProgress(Math.round(((i + pct / 100) / files.length) * 100));
          },
          reject,
          async () => resolve(await getDownloadURL(task.snapshot.ref)),
        );
      });
      urls.push(url);
    }
    return urls;
  };

  // ── form open / close ──────────────────────────────────────────────────────

  const openAddForm = () => {
    setEditingProject(null);
    setForm({ ...EMPTY_FORM });
    setImageMode('upload');
    setShowForm(true);
  };

  const openEditForm = useCallback((project: Project) => {
    setEditingProject(project);
    setForm({
      ...EMPTY_FORM,
      title:          project.title,
      client:         project.client,
      contractor:     project.contractor || '',
      date:           project.date || '',
      category:       project.category,
      type:           project.type,
      featured:       project.featured || false,
      existingImages: getProjectImages(project),
    });
    setImageMode('upload');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setForm({ ...EMPTY_FORM });
    setUploadProgress(0);
  };

  // ── handlers ───────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, imageFiles: Array.from(e.target.files) });
    }
  };

  const handleAddUrl = () => {
    const url = form.imageUrl.trim();
    if (!url) return;
    setForm({ ...form, existingImages: [...form.existingImages, url], imageUrl: '' });
  };

  const handleRemoveExistingImage = (idx: number) => {
    setForm({
      ...form,
      existingImages: form.existingImages.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.client || !form.category || !form.type) {
      alert('Please fill in Title, Client, Category and Type.');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload any new files
      const uploadedUrls = form.imageFiles.length > 0
        ? await uploadFiles(form.imageFiles)
        : [];

      // 2. Merge existing (or manually-entered) URLs with newly uploaded ones
      const allImages = [...form.existingImages, ...uploadedUrls];

      if (allImages.length === 0) {
        alert('Please add at least one image (upload a file or paste a URL).');
        setUploading(false);
        return;
      }

      const payload = {
        title:      form.title.trim(),
        client:     form.client.trim(),
        contractor: form.contractor.trim() || 'Direct Client',
        date:       form.date.trim() || new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        category:   form.category.toLowerCase().trim(),
        type:       form.type.trim(),
        images:     allImages,
        image:      allImages[0],   // keep legacy field in sync
        featured:   form.featured,
      };

      if (editingProject) {
        // ── UPDATE existing document ──
        await updateDoc(doc(db, 'portfolio_projects', editingProject.id), payload);
        alert('Project updated successfully!');
      } else {
        // ── ADD new document ──
        await addDoc(collection(db, 'portfolio_projects'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        alert('Project added to portfolio successfully!');
      }

      closeForm();
      fetchProjects();
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Failed to save project. Check console for details.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this project permanently?')) return;
    try {
      await deleteDoc(doc(db, 'portfolio_projects', id));
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project.');
    }
  }, [fetchProjects]);

  const handleToggleFeatured = useCallback(async (project: Project) => {
    try {
      await updateDoc(doc(db, 'portfolio_projects', project.id), { featured: !project.featured });
      fetchProjects();
    } catch (err) {
      console.error('Error toggling featured:', err);
      alert('Failed to update featured status.');
    }
  }, [fetchProjects]);

  const renderedProjects = useMemo(() => {
    return projects.map(project => {
      const imgs = getProjectImages(project);
      return (
        <tr key={project.id} className="hover:bg-gray-50">
          {/* Image stack preview */}
          <td className="px-6 py-4">
            <div className="flex items-center gap-1">
              {imgs.slice(0, 3).map((src, si) => (
                <div
                  key={si}
                  className="w-10 h-10 rounded overflow-hidden bg-gray-100 relative group border border-gray-200"
                  style={{ marginLeft: si > 0 ? '-6px' : '0', zIndex: 3 - si }}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <a
                    href={src} target="_blank" rel="noreferrer"
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="w-3 h-3 text-white" />
                  </a>
                </div>
              ))}
              {imgs.length > 3 && (
                <span className="text-xs font-semibold text-gray-500 ml-1">+{imgs.length - 3}</span>
              )}
            </div>
          </td>

          <td className="px-6 py-4 font-medium text-gray-900 max-w-[160px]">
            <div className="truncate">{project.title}</div>
          </td>

          <td className="px-6 py-4 text-gray-600">
            <div>{project.client}</div>
            <div className="text-xs text-gray-400">{project.contractor} · {project.date}</div>
          </td>

          <td className="px-6 py-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-orange-100 text-orange-800">
              {project.category}
            </span>
          </td>

          <td className="px-6 py-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {project.type}
            </span>
          </td>

          <td className="px-6 py-4 text-center">
            <button
              onClick={() => handleToggleFeatured(project)}
              title={project.featured ? 'Remove from Hero' : 'Feature in Hero'}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                project.featured
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600'
              }`}
            >
              <Star className={`w-3 h-3 ${project.featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              {project.featured ? 'Featured' : 'Set Featured'}
            </button>
          </td>

          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-1">
              {/* Edit */}
              <button
                onClick={() => openEditForm(project)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Project"
              >
                <Pencil className="w-4 h-4" />
              </button>
              {/* Delete */}
              <button
                onClick={() => handleDelete(project.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      );
    });
  }, [projects, handleToggleFeatured, openEditForm, handleDelete]);

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-gray-900">Portfolio Manager</h2>
          <p className="text-gray-600 text-sm mt-1">Manage project details and photos displayed on the main website</p>
        </div>
        <button
          onClick={showForm ? closeForm : openAddForm}
          className="flex items-center gap-2 bg-flame-700 hover:bg-flame-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Project'}
        </button>
      </div>

      {/* ── Add / Edit Form ── */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="font-heading font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
            {editingProject
              ? <><Pencil className="w-5 h-5 text-flame-700" /> Edit Project</>
              : <><Plus className="w-5 h-5 text-flame-700" /> Upload New Project</>}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                <input
                  type="text" required
                  placeholder="e.g., Fire Hydrant System Installation"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-1 focus:ring-flame-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                <input
                  type="text" required
                  placeholder="e.g., Royal Tulip Hotel"
                  value={form.client}
                  onChange={e => setForm({ ...form, client: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-1 focus:ring-flame-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contractor / Sub-Contractor</label>
                <input
                  type="text"
                  placeholder="e.g., Direct Client or Partner Contractor"
                  value={form.contractor}
                  onChange={e => setForm({ ...form, contractor: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-1 focus:ring-flame-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date / Month &amp; Year</label>
                <input
                  type="text"
                  placeholder="e.g., Aug 2025"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-1 focus:ring-flame-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-1 focus:ring-flame-500 bg-white"
                >
                  <option value="installation">System Installation</option>
                  <option value="maintenance">Maintenance &amp; AMC</option>
                  <option value="supplies">Equipment Supplies</option>
                  <option value="assessment">Risk Assessment</option>
                  <option value="training">Drills &amp; Trainings</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-1 focus:ring-flame-500 bg-white"
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Office">Office</option>
                  <option value="Residential">Residential</option>
                  <option value="Institutional">Institutional</option>
                </select>
              </div>
            </div>

            {/* Featured checkbox */}
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <input
                type="checkbox" id="featured"
                checked={form.featured}
                onChange={e => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 accent-flame-600"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700 cursor-pointer">
                ⭐ Feature this project in the <strong>Hero section</strong> (homepage showcase cards)
              </label>
            </div>

            {/* ── Image Panel ── */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
              <div className="flex gap-4 border-b border-gray-200 pb-2">
                <button
                  type="button" onClick={() => setImageMode('upload')}
                  className={`flex items-center gap-2 pb-2 text-sm font-medium transition-all border-b-2 ${
                    imageMode === 'upload' ? 'border-flame-600 text-flame-700' : 'border-transparent text-gray-500'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" /> Upload Photos
                </button>
                <button
                  type="button" onClick={() => setImageMode('url')}
                  className={`flex items-center gap-2 pb-2 text-sm font-medium transition-all border-b-2 ${
                    imageMode === 'url' ? 'border-flame-600 text-flame-700' : 'border-transparent text-gray-500'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" /> Image URLs
                </button>
              </div>

              {imageMode === 'upload' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
                    Choose Multiple Images (hold Ctrl/Cmd to select many)
                  </label>
                  <input
                    type="file" accept="image/*" multiple
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-flame-50 file:text-flame-700 hover:file:bg-flame-100"
                  />
                  {form.imageFiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.imageFiles.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-flame-50 text-flame-700 text-xs font-medium px-2 py-1 rounded-full">
                          <ImageIcon className="w-3 h-3" /> {f.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
                    Paste an Image URL then click Add
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={form.imageUrl}
                      onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-1 focus:ring-flame-500 bg-white"
                    />
                    <button
                      type="button" onClick={handleAddUrl}
                      className="bg-flame-700 hover:bg-flame-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Already-added / existing image thumbnails */}
              {form.existingImages.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Images in this project ({form.existingImages.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {form.existingImages.map((url, idx) => (
                      <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove this image"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0.5 left-0 right-0 text-center text-[9px] font-bold text-white bg-black/50 py-0.5">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    First image is the cover. Hover a thumbnail to remove it.
                  </p>
                </div>
              )}

              {/* Upload progress bar */}
              {uploading && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                    <span>Uploading images…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-flame-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button" onClick={closeForm} disabled={uploading}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={uploading}
                className="bg-flame-700 hover:bg-flame-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                {uploading ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Uploading…</>
                ) : editingProject ? (
                  <><CheckCircle2 className="w-4 h-4" /> Save Changes</>
                ) : (
                  'Submit Project'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Projects Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-heading font-bold text-gray-800">Uploaded Projects ({projects.length})</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 text-flame-700 animate-spin mr-2" />
            <span className="text-gray-600 text-sm">Loading projects…</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No projects found. Add a project above to display it on the portfolio.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-700">Images</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Client</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 text-center">Hero Featured</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {renderedProjects}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
