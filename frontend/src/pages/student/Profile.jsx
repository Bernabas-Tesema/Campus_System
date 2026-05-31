import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="card space-y-4">
        <div>
          <label className="text-sm text-gray-500">Username</label>
          <p className="font-medium">{user?.username}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Email</label>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Name</label>
          <p className="font-medium">{user?.first_name} {user?.last_name}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Role</label>
          <p className="font-medium capitalize">{user?.role}</p>
        </div>
        {user?.student_profile && (
          <>
            <div>
              <label className="text-sm text-gray-500">Student ID</label>
              <p className="font-medium">{user.student_profile.student_id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Department</label>
              <p className="font-medium">{user.student_profile.department}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
