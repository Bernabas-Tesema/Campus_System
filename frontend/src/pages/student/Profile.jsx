import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import { authAPI } from '../../services/api';

export default function Profile() {
  const { user } = useAuth();
  const uid = user?.id || 'anon';
  const days = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], []);

  const emptyPlan = useMemo(() => {
    const p = {};
    days.forEach((d) => { p[d] = { breakfast: '', lunch: '', dinner: '' }; });
    return p;
  }, [days]);

  const [weekPlan, setWeekPlan] = useState(emptyPlan);
  const [showPlan, setShowPlan] = useState(true);
  const { user: currentUser, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', student_id: '', department: '' });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`meal_plan_${uid}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        // support both new nested format and old flat format
        if (parsed.week && typeof parsed.week === 'object' && parsed.week[days[0]] && parsed.week[days[0]].breakfast !== undefined) {
          setWeekPlan(parsed.week);
        } else if (parsed.week && typeof parsed.week === 'object') {
          // flatten fallback
          const p = { ...emptyPlan };
          Object.keys(parsed.week).forEach((k) => { p[k] = parsed.week[k] || p[k]; });
          setWeekPlan(p);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [uid, days, emptyPlan]);

  useEffect(() => {
    if (currentUser) {
      setForm({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || 'bernabastesemagedore@gmail.com',
        student_id: currentUser.student_profile?.student_id || '',
        department: currentUser.student_profile?.department || '',
      });
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`meal_plan_${uid}`, JSON.stringify({ week: weekPlan }));
  }, [weekPlan, uid]);

  const setMeal = (day, meal, value) => {
    setWeekPlan((prev) => ({ ...prev, [day]: { ...prev[day], [meal]: value } }));
  };

  const clearPlan = () => setWeekPlan(emptyPlan);

  const startEdit = () => setEditing(true);
  const cancelEdit = () => {
    setEditing(false);
    if (currentUser) {
      setForm({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || 'bernabastesemagedore@gmail.com',
        student_id: currentUser.student_profile?.student_id || '',
        department: currentUser.student_profile?.department || '',
      });
    }
  };

  const saveProfile = async () => {
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        student_profile: {
          student_id: form.student_id,
          department: form.department,
        },
      };
      const res = await authAPI.update(payload);
      // update auth context
      setUser(res.data);
      setEditing(false);
      // also persist any existing plan under new uid if changed
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Failed to save profile.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="-ml-4 w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {currentUser?.first_name?.[0] || currentUser?.username?.[0] || 'U'}{currentUser?.last_name?.[0] || ''}
            </div>
            <div className="flex-1">
              {!editing ? (
                <>
                  <h2 className="text-xl font-semibold">{currentUser?.first_name} {currentUser?.last_name}</h2>
                  <p className="text-sm text-gray-500">{currentUser?.email}</p>
                  <p className="text-sm mt-1 font-medium capitalize">{currentUser?.role}</p>
                </>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <input className="input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="First name" />
                  <input className="input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Last name" />
                  <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            {!editing ? (
              <button type="button" className="btn-outline" onClick={startEdit}>Edit</button>
            ) : (
              <div className="flex gap-2">
                <button type="button" className="btn-primary" onClick={saveProfile}>Save</button>
                <button type="button" className="btn-outline" onClick={cancelEdit}>Cancel</button>
              </div>
            )}
          </div>
          

          <div className="pt-4 border-t">
            <h3 className="text-sm text-gray-500 mb-2">Account details</h3>
            <div className="text-sm">
              <div className="flex justify-between py-1"><span className="text-gray-600">Username</span><strong>{currentUser?.username}</strong></div>
              {currentUser?.student_profile && (
                <>
                  {!editing ? (
                    <>
                      <div className="flex justify-between py-1"><span className="text-gray-600">Student ID</span><strong>{currentUser.student_profile.student_id}</strong></div>
                      <div className="flex justify-between py-1"><span className="text-gray-600">Department</span><strong>{currentUser.student_profile.department}</strong></div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <input className="input" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} placeholder="Student ID" />
                      <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Department" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Meal Plan</h2>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-outline" onClick={() => setShowPlan((s) => !s)}>{showPlan ? 'Hide' : 'Show'}</button>
              <button type="button" className="btn-secondary" onClick={clearPlan}>Clear</button>
            </div>
          </div>

          {showPlan ? (
            <div className="overflow-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left text-sm text-gray-600">
                    <th className="p-2 border-b">Day</th>
                    <th className="p-2 border-b">Breakfast</th>
                    <th className="p-2 border-b">Lunch</th>
                    <th className="p-2 border-b">Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((d) => (
                    <tr key={d} className="align-top">
                      <td className="p-2 font-medium border-b">{d}</td>
                      <td className="p-2 border-b">
                        <input className="input w-full" value={weekPlan[d]?.breakfast || ''} onChange={(e) => setMeal(d, 'breakfast', e.target.value)} placeholder="e.g. Eggs & Toast" />
                      </td>
                      <td className="p-2 border-b">
                        <input className="input w-full" value={weekPlan[d]?.lunch || ''} onChange={(e) => setMeal(d, 'lunch', e.target.value)} placeholder="e.g. Salad" />
                      </td>
                      <td className="p-2 border-b">
                        <input className="input w-full" value={weekPlan[d]?.dinner || ''} onChange={(e) => setMeal(d, 'dinner', e.target.value)} placeholder="e.g. Pasta" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mt-4">
                <button type="button" className="btn-primary" onClick={() => alert('Plan saved locally.')}>Save Plan</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Meal planner hidden. Click Show to edit your weekly meals.</p>
          )}
        </div>
      </div>
    </div>
  );
}
