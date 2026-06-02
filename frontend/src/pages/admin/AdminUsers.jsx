import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    adminAPI.users().then((res) => setUsers(res.data.results || res.data));
  }, []);

  const toggleActive = async (user) => {
    const next = !user.is_active;
    const res = await adminAPI.updateUser(user.id, { is_active: next });
    const updated = res.data;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(`Delete user "${user.username}"? This cannot be undone.`);
    if (!confirmed) return;
    await adminAPI.deleteUser(user.id);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3 pr-4">Username</th>
              <th className="pb-3 pr-4">Email</th>
              <th className="pb-3 pr-4">Role</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Joined</th>
              <th className="pb-3 pl-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="py-3 pr-4 font-medium">{u.username}</td>
                <td className="py-3 pr-4">{u.email}</td>
                <td className="py-3 pr-4"><span className="badge bg-primary/10 text-primary capitalize">{u.role}</span></td>
                <td className="py-3 pr-4">{u.is_active ? '✅ Active' : '❌ Inactive'}</td>
                <td className="py-3">{new Date(u.date_joined).toLocaleDateString()}</td>
                <td className="py-3 pl-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={u.is_active ? 'btn-outline text-xs px-3 py-1' : 'btn-primary text-xs px-3 py-1'}
                      onClick={() => toggleActive(u)}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      className="btn-outline text-xs px-3 py-1 text-error border-error hover:bg-red-50"
                      onClick={() => handleDeleteUser(u)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
