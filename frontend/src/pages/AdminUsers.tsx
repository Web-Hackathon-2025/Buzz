import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, UserCheck, UserX,
  Mail, Phone, Calendar, Shield, AlertCircle
} from 'lucide-react';
import { api } from '../utils/api';
import Layout from '../components/Layout';

interface User {
  id: string;
  email: string;
  phone: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
  is_active: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = { page, page_size: pageSize };
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }
      const data = await api.getAdminUsers(params);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.updateUserStatus(userId, !currentStatus);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(search) ||
      user.full_name?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search)
    );
  });

  if (loading && users.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            <p className="mt-4 text-stone-600">Loading users...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50">
        {/* Header */}
        <div className="bg-white border-b border-amber-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-800 via-orange-800 to-amber-900 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-stone-600 mt-2">Manage all platform users</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-stone-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customers</option>
                  <option value="provider">Providers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-stone-700 font-semibold">User</th>
                    <th className="text-left py-4 px-6 text-stone-700 font-semibold">Contact</th>
                    <th className="text-left py-4 px-6 text-stone-700 font-semibold">Role</th>
                    <th className="text-left py-4 px-6 text-stone-700 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 text-stone-700 font-semibold">Joined</th>
                    <th className="text-left py-4 px-6 text-stone-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-stone-900">{user.full_name || 'N/A'}</div>
                        <div className="text-sm text-stone-500">{user.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        {user.phone ? (
                          <div className="flex items-center gap-2 text-stone-600">
                            <Phone size={16} />
                            {user.phone}
                          </div>
                        ) : (
                          <span className="text-stone-400">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-amber-100 text-amber-800' :
                          user.role === 'provider' ? 'bg-orange-100 text-orange-800' :
                          'bg-stone-100 text-stone-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-stone-600 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.is_active)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            user.is_active
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <UserX size={16} className="inline mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck size={16} className="inline mr-1" />
                              Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-between">
              <div className="text-stone-600">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * pageSize >= total}
                  className="px-4 py-2 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminUsers;

