import { NavLink } from 'react-router-dom';
import {
  FiHome, FiFileText, FiVideo, FiImage, FiTag,
  FiDollarSign, FiUsers, FiBarChart2, FiX,
  FiRadio, FiCheck, FiMail, FiTrendingUp,
  FiZap, FiInbox, FiMessageSquare, FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  { to: '/', icon: <FiHome />, label: 'Dashboard', exact: true },

  { label: 'AMAKURU', type: 'heading' },
  { to: '/articles',        icon: <FiFileText />,  label: 'Inkuru Zose' },
  { to: '/articles/create', icon: <FiFileText />,  label: 'Andika Inkuru' },
  { to: '/articles/review', icon: <FiCheck />,     label: 'Suzuma Inkuru', roles: ['super_admin','admin','editor'] },
  { to: '/categories',      icon: <FiTag />,       label: 'Ibyiciro', roles: ['super_admin','admin'] },

  { label: 'IMBONI TV', type: 'heading' },
  { to: '/videos',          icon: <FiVideo />,     label: 'Videos' },
  { to: '/videos/upload',   icon: <FiVideo />,     label: 'Shyiraho Video' },
  { to: '/videos/live',     icon: <FiRadio />,     label: 'Live Streams' },
  { to: '/media',           icon: <FiImage />,     label: 'Ububiko bwa Media' },

  { label: 'KWAMAMAZA', type: 'heading' },
  { to: '/ads',              icon: <FiBarChart2 />,   label: 'Ad Dashboard',        roles: ['super_admin','admin','ad_manager'] },
  { to: '/ads/amatangazo',   icon: <FiZap />,         label: 'Amatangazo',          roles: ['super_admin','admin','editor'] },
  { to: '/ads/kwamamaza',    icon: <FiMail />,        label: 'Ubusabe Bushya',      roles: ['super_admin','admin','ad_manager'] },
  { to: '/ads/campaigns',    icon: <FiZap />,         label: "Inzira z'Itangazo",  roles: ['super_admin','admin','ad_manager'] },
  { to: '/ads/advertisers',  icon: <FiUsers />,       label: 'Abatangaza',          roles: ['super_admin','admin','ad_manager'] },
  { to: '/ads/requests',     icon: <FiInbox />,       label: 'Ubusabe Bwose',       roles: ['super_admin','admin','ad_manager'] },
  { to: '/ads/invoices',     icon: <FiDollarSign />,  label: 'Fagitire',            roles: ['super_admin','admin','ad_manager'] },

  { label: 'ABAKORESHA', type: 'heading' },
  { to: '/users/staff',   icon: <FiUsers />,          label: 'Abakozi',              roles: ['super_admin','admin'] },
  { to: '/users/readers', icon: <FiUsers />,          label: 'Abasomyi',             roles: ['super_admin','admin'] },
  { to: '/comments',      icon: <FiMessageSquare />,  label: 'Ibitekerezo',          roles: ['super_admin','admin','editor'] },
  { to: '/newstips',      icon: <FiAlertCircle />,    label: 'Ikibazo cy\'Inkuru',   roles: ['super_admin','admin','editor','journalist'] },
  { to: '/analytics',     icon: <FiTrendingUp />,     label: 'Imibare',              roles: ['super_admin','admin'] },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  const canSee = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  };

  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-60 bg-secondary text-white
        flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <span className="text-lg font-bold text-primary">IMBONI</span>
            <span className="text-lg font-bold text-white"> CMS</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <FiX size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV.map((item, i) => {
            if (item.type === 'heading') return (
              <p key={i} className="text-xs text-gray-500 font-semibold px-3 pt-4 pb-1 uppercase tracking-wider">
                {item.label}
              </p>
            );
            if (!canSee(item)) return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10'
                  }`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User info */}
        <div className="px-4 py-3 border-t border-white/10 text-xs text-gray-400">
          <p className="font-medium text-white truncate">{user?.name}</p>
          <p className="capitalize">{user?.role?.replace('_', ' ')}</p>
        </div>
      </aside>
    </>
  );
}
