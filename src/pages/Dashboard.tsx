import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.profile?.full_name || user?.username}!</h2>
        <p className="text-gray-600">This is your dashboard. Here you can manage your lessons.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/lessons/new"
          className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          <h3 className="text-xl font-semibold mb-2">Create New Lesson</h3>
          <p className="text-blue-100">Start creating a new educational lesson</p>
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">My Lessons</h3>
          <p className="text-gray-600">View and manage your lessons (coming soon)</p>
        </div>
      </div>
    </div>
  );
};

