import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader,
  Calendar,
  Flag,
  User,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'installation' | 'training' | 'site_visit' | 'follow_up';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  due_date: string;
  created_at: string;
}

const categoryColors: Record<string, string> = {
  maintenance: 'bg-blue-100 text-blue-700',
  installation: 'bg-green-100 text-green-700',
  training: 'bg-purple-100 text-purple-700',
  site_visit: 'bg-amber-100 text-amber-700',
  follow_up: 'bg-cyan-100 text-cyan-700',
};

const priorityColors: Record<string, string> = {
  low: 'text-gray-600',
  medium: 'text-amber-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
};

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  on_hold: 'bg-yellow-100 text-yellow-700',
};

export default function TaskManager() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'maintenance' as Task['category'],
    priority: 'medium' as Task['priority'],
    assigned_to: '',
    status: 'pending' as Task['status'],
    due_date: '',
  });

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      const q = query(collection(db, 'internal_tasks'), orderBy('due_date', 'asc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Task));
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.category || !form.due_date) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const taskData = {
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
        assigned_to: form.assigned_to,
        status: form.status,
        due_date: form.due_date,
      };

      if (editingId) {
        await updateDoc(doc(db, 'internal_tasks', editingId), taskData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'internal_tasks'), {
          ...taskData,
          created_at: new Date().toISOString()
        });
      }

      setSuccessMsg(
        editingId ? 'Task updated successfully!' : 'Task created successfully!'
      );
      setTimeout(() => setSuccessMsg(''), 3000);

      setForm({
        title: '',
        description: '',
        category: 'maintenance',
        priority: 'medium',
        assigned_to: '',
        status: 'pending',
        due_date: '',
      });
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      console.error('Error saving task:', err);
      alert('Error saving task');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;

    try {
      await deleteDoc(doc(db, 'internal_tasks', id));
      setSuccessMsg('Task deleted');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const updateTaskStatus = async (id: string, newStatus: Task['status']) => {
    try {
      await updateDoc(doc(db, 'internal_tasks', id), { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const filteredTasks =
    filter === 'all'
      ? tasks
      : filter === 'active'
      ? tasks.filter((t) => t.status !== 'completed')
      : tasks.filter((t) => t.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-flame-700 animate-spin mr-2" />
        <span className="text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-3xl text-gray-900">Internal Tasks</h1>
          <p className="text-gray-600 text-sm mt-1">
            {filteredTasks.length} of {tasks.length} tasks
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
          New Task
        </button>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'pending', 'in_progress', 'completed', 'on_hold'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-flame-700 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-flame-300'
            }`}
          >
            {f === 'all'
              ? 'All Tasks'
              : f === 'active'
              ? 'Active'
              : f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-heading font-bold text-xl mb-4">
            {editingId ? 'Edit Task' : 'Create New Task'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Fire hydrant maintenance at Royal Tulip Hotel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100 bg-white"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="installation">Installation</option>
                  <option value="training">Training</option>
                  <option value="site_visit">Site Visit</option>
                  <option value="follow_up">Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  placeholder="Team member name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-100 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
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
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-flame-700 hover:bg-flame-600 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                {editingId ? 'Update Task' : 'Create Task'}
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
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${categoryColors[task.category]}`}>
                      {task.category.replace('_', ' ').charAt(0).toUpperCase() +
                        task.category.replace('_', ' ').slice(1)}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[task.status]}`}>
                      {task.status.replace('_', ' ').charAt(0).toUpperCase() +
                        task.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    {task.assigned_to && (
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {task.assigned_to}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(task.due_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className={`flex items-center gap-1 font-medium ${priorityColors[task.priority]}`}>
                      <Flag className="w-3.5 h-3.5" />
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'completed')}
                      className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600"
                      title="Mark as complete"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingId(task.id);
                      setShowForm(true);
                      setForm({
                        title: task.title,
                        description: task.description,
                        category: task.category,
                        priority: task.priority,
                        assigned_to: task.assigned_to,
                        status: task.status,
                        due_date: task.due_date,
                      });
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
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
