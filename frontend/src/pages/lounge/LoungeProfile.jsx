import { useEffect, useState } from 'react';
import { loungeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Lounge owners can edit their lounge profile using this page.

export default function LoungeProfile() {
  const { user, setUser } = useAuth();
  const [lounge, setLounge] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', contact: '', description: '' });

  useEffect(() => {
    loungeAPI
      .getProfile()
      .then((res) => setLounge(res.data))
      .catch(() => setLounge(null));
  }, [user]);

  useEffect(() => {
    if (lounge) {
      setForm({
        name: lounge.name || '',
        location: lounge.location || '',
        contact: lounge.contact || '',
        description: lounge.description || '',
      });
    }
  }, [lounge]);

  const startEdit = () => setEditing(true);
  const cancelEdit = () => {
    setEditing(false);
    if (lounge) {
      setForm({
        name: lounge.name || '',
        location: lounge.location || '',
        contact: lounge.contact || '',
        description: lounge.description || '',
      });
    }
  };

  const saveLounge = async () => {
    if (!lounge?.id) {
      // eslint-disable-next-line no-alert
      alert('No lounge to update');
      return;
    }
    try {
      const payload = {
        name: form.name,
        location: form.location,
        description: form.description,
      };
      const res = await loungeAPI.updateProfile(payload);
      setLounge(res.data);
      // update auth context if user has lounge_profile
      if (user?.lounge_profile) setUser({ ...user, lounge_profile: res.data });
      setEditing(false);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Failed to save lounge profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Lounge Profile</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-4xl text-gray-400">🏠</div>
          {!editing ? (
            <>
              <h2 className="mt-4 text-xl font-semibold">{lounge?.name || 'Unnamed Lounge'}</h2>
              <p className="text-sm text-gray-500">{lounge?.location || 'Location not set'}</p>
            </>
          ) : (
            <div className="mt-4 space-y-2">
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lounge name" />
              <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" />
            </div>
          )}
        </div>

        <div className="md:col-span-2 card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Details</h3>
            {!editing ? (
              <button type="button" className="btn-outline" onClick={startEdit}>Edit</button>
            ) : (
              <div className="flex gap-2">
                <button type="button" className="btn-primary" onClick={saveLounge}>Save</button>
                <button type="button" className="btn-outline" onClick={cancelEdit}>Cancel</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              {!editing ? <p className="font-medium">{lounge?.contact || '—'}</p> : <input className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />}
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{lounge?.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Description</p>
              {!editing ? <p className="font-medium">{lounge?.description || '—'}</p> : <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
