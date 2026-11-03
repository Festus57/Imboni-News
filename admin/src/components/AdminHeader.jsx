import { FiMenu, FiLogOut, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminHeader({ onMenuToggle }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm px-5 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="text-gray-600 hover:text-primary" aria-label="Toggle sidebar">
          <FiMenu size={22} />
        </button>
        <span className="text-sm text-gray-500 hidden sm:block">Imboni News — Content Management System</span>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1 text-xs text-gray-500 hover:text-primary"
        >
          <FiExternalLink size={14} /> Reba Urubuga
        </a>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <FiLogOut size={16} /> Sohoka
          </button>
        </div>
      </div>
    </header>
  );
}
