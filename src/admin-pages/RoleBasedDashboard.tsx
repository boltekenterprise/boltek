"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader } from 'lucide-react';

interface UserRole {
  role_code: string;
  role_name: string;
  department: string;
}

export default function RoleBasedDashboard() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      if (!user) return;
      const docRef = doc(db, 'admin_users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserRole({
          role_code: userData.role || 'pending',
          role_name: (userData.role || 'pending').replace('_', ' ').toUpperCase(),
          department: 'Operations',
        });
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-flame-700 animate-spin mr-2" />
        <span className="text-gray-600">Loading your dashboard...</span>
      </div>
    );
  }

  // Default Admin dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-black text-3xl text-gray-900">Welcome</h1>
        <p className="text-gray-600 mt-1">Role: {userRole?.role_name || 'Administrator'}</p>
        <p className="text-gray-600">Department: {userRole?.department || 'Management'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-heading font-bold text-blue-900 mb-2">Projects</h3>
          <p className="text-sm text-blue-700">Track projects and quotations</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="font-heading font-bold text-green-900 mb-2">Services</h3>
          <p className="text-sm text-green-700">Manage client services</p>
        </div>
      </div>
    </div>
  );
}
