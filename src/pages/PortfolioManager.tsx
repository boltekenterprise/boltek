import { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Plus, Trash2, Loader, Image as ImageIcon, Link as LinkIcon, ExternalLink, Star } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  client: string;
  contractor: string;
  date: string;
  category: string;
  type: string;
  image: string;
  featured?: boolean;
  createdAt?: unknown;
}

export default function PortfolioManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  
  const [form, setForm] = useState({
    title: '',
    client: '',
    contractor: '',
    date: '',
    category: 'installation',
    type: 'Commercial',
    featured: false,
    imageFile: null as File | null,
    imageUrl: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const q = query(collection(db, 'portfolio_projects'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Project));
      setProjects(data);
    } catch (err) {
      console.error('Error fetching portfolio projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, imageFile: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.client || !form.category || !form.type) {
      alert('Please fill in all required fields (Title, Client, Category, Type)');
      return;
    }

    let finalImageUrl = form.imageUrl;

    try {
      setUploading(true);

      // Handle Image File Upload if in upload mode
      if (imageMode === 'upload' && form.imageFile) {
        const file = form.imageFile;
        const fileRef = ref(storage, `portfolio/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        // Wait for upload completion using a promise
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

      if (!finalImageUrl && imageMode === 'upload') {
        alert('Please choose an image file to upload or switch to Image URL mode.');
        setUploading(false);
        return;
      }

      if (!finalImageUrl && imageMode === 'url') {
        alert('Please enter an image URL.');
        setUploading(false);
        return;
      }

      // Save to firestore
      await addDoc(collection(db, 'portfolio_projects'), {
        title: form.title,
        client: form.client,
        contractor: form.contractor || 'Direct Client',
        date: form.date || new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        category: form.category.toLowerCase().trim(),
        type: form.type.trim(),
        image: finalImageUrl,
        featured: form.featured,
        createdAt: serverTimestamp(),
      });

      // Reset Form
      setForm({
        title: '',
        client: '',
        contractor: '',
        date: '',
        category: 'installation',
        type: 'Commercial',
        featured: false,
        imageFile: null,
        imageUrl: '',
      });
      setShowForm(false);
      setUploadProgress(0);
      fetchProjects();
      alert('Project added to portfolio successfully!');
    } catch (err) {
      console.error('Error adding project:', err);
      alert('Failed to save project');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project from the portfolio?')) return;
    try {
      await deleteDoc(doc(db, 'portfolio_projects', id));
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    try {
      await updateDoc(doc(db, 'portfolio_projects', project.id), {
        featured: !project.featured,
      });
      fetchProjects();
    } catch (err) {
      console.error('Error toggling featured:', err);
      alert('Failed to update featured status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-gray-900">Portfolio Manager</h2>
          <p className="text-gray-600 text-sm mt-1">Manage project details and photos displayed on the main website</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-flame-700 hover:bg-flame-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Project'}
        </button>
      </div>

      {/* Add Project Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="font-heading font-bold text-lg mb-4 text-gray-900">Upload New Project</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Fire Hydrant System Installation"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-1 focus:ring-flame-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Royal Tulip Hotel"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-1 focus:ring-flame-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contractor / Sub-Contractor</label>
                <input
                  type="text"
                  placeholder="e.g., Direct Client or Partner Contractor"
                  value={form.contractor}
                  onChange={(e) => setForm({ ...form, contractor: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-1 focus:ring-flame-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date / Month & Year</label>
                <input
                  type="text"
                  placeholder="e.g., Aug 2025"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-1 focus:ring-flame-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-1 focus:ring-flame-500 bg-white"
                >
                  <option value="installation">System Installation</option>
                  <option value="maintenance">Maintenance & AMC</option>
                  <option value="supplies">Equipment Supplies</option>
                  <option value="assessment">Risk Assessment</option>
                  <option value="training">Drills & Trainings</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
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

            {/* Featured for Hero */}
            <div className="col-span-full flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 accent-flame-600"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700 cursor-pointer">
                ⭐ Feature this project in the <strong>Hero section</strong> (homepage showcase cards)
              </label>
            </div>

            {/* Image Selection */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-4">
              <div className="flex gap-4 mb-3 border-b border-gray-200 pb-2">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex items-center gap-2 pb-2 text-sm font-medium transition-all border-b-2 ${
                    imageMode === 'upload' ? 'border-flame-600 text-flame-700' : 'border-transparent text-gray-500'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Upload Photo
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex items-center gap-2 pb-2 text-sm font-medium transition-all border-b-2 ${
                    imageMode === 'url' ? 'border-flame-600 text-flame-700' : 'border-transparent text-gray-500'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  Image URL
                </button>
              </div>

              {imageMode === 'upload' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Choose Project Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-flame-50 file:text-flame-700 hover:file:bg-flame-100"
                  />
                  {form.imageFile && (
                    <p className="text-xs text-gray-600 mt-2">Selected: {form.imageFile.name}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Paste Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-1 focus:ring-flame-500 bg-white"
                  />
                </div>
              )}

              {uploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                    <span>Uploading image...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-flame-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="bg-flame-700 hover:bg-flame-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Submit Project'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-heading font-bold text-gray-800">Uploaded Projects ({projects.length})</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 text-flame-700 animate-spin mr-2" />
            <span className="text-gray-600 text-sm">Loading projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No project uploads found in Firestore. Add a project above to display it on the portfolio.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-700">Preview</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Client</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 text-center">Hero Featured</th>
                  <th className="px-6 py-3 font-semibold text-gray-700 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="w-16 h-10 rounded overflow-hidden bg-gray-100 relative group">
                        <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                        <a
                          href={project.image}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-white" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{project.title}</td>
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
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
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
