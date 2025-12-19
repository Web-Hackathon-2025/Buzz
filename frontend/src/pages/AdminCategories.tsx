import { useState, useEffect } from 'react';
import { 
  Package, Plus, Edit, Trash2, Search,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { api } from '../utils/api';
import Layout from '../components/Layout';

interface Category {
  id: number;
  name: string;
  icon_url: string | null;
  created_at: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', icon_url: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminCategories();
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.createCategory({
        name: formData.name,
        icon_url: formData.icon_url || undefined,
      });
      setShowModal(false);
      setFormData({ name: '', icon_url: '' });
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;
    try {
      await api.updateCategory(editingCategory.id, {
        name: formData.name,
        icon_url: formData.icon_url || undefined,
      });
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', icon_url: '' });
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.deleteCategory(id);
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, icon_url: category.icon_url || '' });
    setShowModal(true);
  };

  if (loading && categories.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            <p className="mt-4 text-stone-600">Loading categories...</p>
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
                  Category Management
                </h1>
                <p className="text-stone-600 mt-2">Manage service categories</p>
              </div>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setFormData({ name: '', icon_url: '' });
                  setShowModal(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2"
              >
                <Plus size={20} />
                Add Category
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-2xl shadow-lg border border-stone-100 p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {category.icon_url ? (
                      <img src={category.icon_url} alt={category.name} className="w-12 h-12 rounded-lg" />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                        <Package className="text-white" size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-stone-900">{category.name}</h3>
                      <p className="text-sm text-stone-500">
                        Created {new Date(category.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="flex-1 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Edit size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-stone-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-stone-700 font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-2">Icon URL (optional)</label>
                  <input
                    type="url"
                    value={formData.icon_url}
                    onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="https://example.com/icon.png"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    setFormData({ name: '', icon_url: '' });
                  }}
                  className="flex-1 px-4 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={editingCategory ? handleUpdate : handleCreate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminCategories;

