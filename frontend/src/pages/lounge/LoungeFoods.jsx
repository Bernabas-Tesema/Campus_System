import { useState, useEffect } from 'react';
import { foodAPI } from '../../services/api';
import { formatBirr } from '../../utils/currency';

export default function LoungeFoods() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    meal_time: 'lunch',
    category: '',
    image_url: '',
    prep_time_minutes: 15,
  });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '🍽️' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    setError('');
    Promise.all([foodAPI.manage(), foodAPI.categories()])
      .then(([foodsRes, catsRes]) => {
        setFoods(foodsRes.data.results || foodsRes.data);
        setCategories(catsRes.data.results || catsRes.data);
      })
      .catch((err) => {
        const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to load data.';
        setError(msg);
        setFoods([]);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await foodAPI.create({
      ...form,
      price: parseFloat(form.price),
      is_available: true,
      category: form.category ? Number(form.category) : null,
    });
    setShowForm(false);
    setForm({
      name: '',
      description: '',
      price: '',
      meal_time: 'lunch',
      category: '',
      image_url: '',
      prep_time_minutes: 15,
    });
    fetchData();
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    await foodAPI.createCategory(categoryForm);
    setShowCategoryForm(false);
    setCategoryForm({ name: '', description: '', icon: '🍽️' });
    fetchData();
  };

  const toggleAvailability = async (food) => {
    await foodAPI.update(food.id, { is_available: !food.is_available });
    fetchData();
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  if (error) {
    return (
      <div className="card">
        <h1 className="text-2xl font-bold mb-2">Lounge Account</h1>
        <p className="text-gray-600">{error}</p>
        <p className="text-sm text-gray-500 mt-2">An admin needs to activate your lounge to manage foods.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Food Management</h1>
        <div className="flex gap-3">
          <button onClick={() => setShowCategoryForm(!showCategoryForm)} className="btn-outline">
            {showCategoryForm ? 'Cancel Category' : 'Add Category'}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel Food' : 'Add Food'}
          </button>
        </div>
      </div>

      {showCategoryForm && (
        <form onSubmit={handleCreateCategory} className="card mb-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category name</label>
            <input
              className="input"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
            <input
              className="input"
              value={categoryForm.icon}
              onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
              placeholder="🍽️"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              className="input"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">Save Category</button>
          </div>
        </form>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (ETB)</label>
            <input
              className="input"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meal time</label>
            <select
              className="input"
              value={form.meal_time}
              onChange={(e) => setForm({ ...form, meal_time: e.target.value })}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              disabled={categories.length === 0}
            >
              <option value="">{categories.length === 0 ? 'Create a category first' : 'Select a category'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">Add a category above, then add foods.</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Food photo URL</label>
            <input
              className="input"
              type="url"
              placeholder="https://..."
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
            {form.image_url && (
              <div className="mt-3">
                <img
                  src={form.image_url}
                  alt="Food preview"
                  className="w-full max-w-sm h-40 object-cover rounded-lg"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prep time (minutes)</label>
            <input
              className="input"
              type="number"
              value={form.prep_time_minutes}
              onChange={(e) => setForm({ ...form, prep_time_minutes: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">Save Food Item</button>
          </div>
        </form>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {foods.map((food) => (
          <div key={food.id} className={`card ${!food.is_available ? 'opacity-50' : ''}`}>
            {food.image_url && (
              <img
                src={food.image_url}
                alt={food.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
                loading="lazy"
              />
            )}
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{food.name}</h3>
              <span className="text-primary font-bold">{formatBirr(food.price)}</span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{food.category_name ? `${food.category_name} · ` : ''}{food.meal_time}</p>
            <p className="text-sm text-gray-500 mb-3">{food.description}</p>
            <button
              onClick={() => toggleAvailability(food)}
              className={`text-sm px-3 py-1 rounded-lg ${food.is_available ? 'bg-green-100 text-success' : 'bg-red-100 text-error'}`}
            >
              {food.is_available ? 'Available' : 'Unavailable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
