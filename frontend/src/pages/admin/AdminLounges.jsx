import { useState, useEffect } from 'react';
import { loungeAPI } from '../../services/api';

export default function AdminLounges() {
  const [lounges, setLounges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', description: '' });

  const fetchLounges = () => {
    loungeAPI.adminList().then((res) => setLounges(res.data.results || res.data));
  };

  useEffect(() => { fetchLounges(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await loungeAPI.adminCreate(form);
    setShowForm(false);
    setForm({ name: '', location: '', description: '' });
    fetchLounges();
  };

  const toggleActive = async (lounge) => {
    await loungeAPI.adminUpdate(lounge.id, { is_active: !lounge.is_active });
    fetchLounges();
  };

  const handleDeleteLounge = async (lounge) => {
    const confirmed = window.confirm(`Delete lounge "${lounge.name}"? This cannot be undone.`);
    if (!confirmed) return;
    await loungeAPI.adminDelete(lounge.id);
    setLounges((prev) => prev.filter((l) => l.id !== lounge.id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lounge Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Add Lounge'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 space-y-3">
          {['name', 'location', 'description'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
              <input className="input" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required={field !== 'description'} />
            </div>
          ))}
          <button type="submit" className="btn-primary">Create Lounge</button>
        </form>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {lounges.map((l) => (
          <div key={l.id} className="card">
            <h3 className="text-lg font-semibold">{l.name}</h3>
            <p className="text-sm text-gray-500">{l.location}</p>
            <p className="text-sm text-gray-600 mt-2">{l.description}</p>
            <div className="flex gap-4 mt-3 text-sm">
              <span>{l.food_count || 0} foods</span>
              <span>{l.staff_count || 0} staff</span>
              <span className={l.is_active ? 'text-success' : 'text-error'}>{l.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className={l.is_active ? 'btn-outline text-sm' : 'btn-primary text-sm'}
                onClick={() => toggleActive(l)}
              >
                {l.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                type="button"
                className="btn-outline text-sm text-error border-error hover:bg-red-50"
                onClick={() => handleDeleteLounge(l)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
