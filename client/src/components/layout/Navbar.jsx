import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMenu, FiX, FiVideo, FiRadio, FiSearch } from 'react-icons/fi';
import { getCategories } from '../../services/newsService.js';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.data.categories.slice(0, 7)))
      .catch(() => {});
  }, []);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap ${
      isActive ? 'text-primary bg-red-50' : 'text-gray-700'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">

        {/* ── Desktop ── */}
        <div className="hidden md:flex items-center gap-1 h-12 overflow-x-auto scrollbar-hide">
          <NavLink to="/" end className={linkClass}>Ahabanza</NavLink>
          <NavLink to="/imboni-tv" className={linkClass}>
            <span className="flex items-center gap-1.5"><FiVideo size={15} /> Imboni TV</span>
          </NavLink>
          <NavLink to="/live" className={linkClass}>
            <span className="flex items-center gap-1.5 text-red-600 font-semibold">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
              <FiRadio size={15} /> LIVE
            </span>
          </NavLink>
          <NavLink to="/shorts" className={linkClass}>Shorts</NavLink>
          {categories.map((cat) => (
            <NavLink key={cat._id} to={`/category/${cat.slug}`} className={linkClass}>
              {cat.nameKiny}
            </NavLink>
          ))}
          <NavLink to="/fact-check" className={linkClass}>Fact Check</NavLink>
          {/* Amatangazo */}
          <NavLink to="/amatangazo" className={linkClass}>
            🗞️ Amatangazo
          </NavLink>
          {/* Tangaza — highlighted button */}
          <NavLink to="/advertise"
            className={({ isActive }) =>
              `text-sm font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ml-1 flex-shrink-0 ${
                isActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
              }`
            }>
            📢 Tangaza
          </NavLink>
        </div>

        {/* ── Mobile top bar ── */}
        <div className="flex md:hidden items-center justify-between h-12">
          <NavLink to="/" end className="text-sm font-bold text-primary" onClick={() => setOpen(false)}>
            IMBONI
          </NavLink>
          <div className="flex items-center gap-2">
            <Link to="/search" className="p-2 text-gray-600 hover:text-primary" aria-label="Shakisha">
              <FiSearch size={18} />
            </Link>
            <button className="p-2 text-gray-700 hover:text-primary" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute left-0 right-0 top-12 z-40 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 flex flex-col gap-1">
            <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>Ahabanza</NavLink>
            <NavLink to="/imboni-tv" className={linkClass} onClick={() => setOpen(false)}>
              <span className="flex items-center gap-1.5"><FiVideo size={15} /> Imboni TV</span>
            </NavLink>
            <NavLink to="/live" className={linkClass} onClick={() => setOpen(false)}>
              <span className="flex items-center gap-1.5 text-red-600 font-semibold"><FiRadio size={15} /> LIVE</span>
            </NavLink>
            <NavLink to="/shorts" className={linkClass} onClick={() => setOpen(false)}>Shorts</NavLink>

            {categories.length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 pt-3 pb-1">Ibyiciro</p>
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((cat) => (
                    <NavLink key={cat._id} to={`/category/${cat.slug}`}
                      className="text-sm text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100"
                      onClick={() => setOpen(false)}>
                      {cat.nameKiny}
                    </NavLink>
                  ))}
                </div>
              </>
            )}

            <div className="border-t border-gray-100 mt-2 pt-2 space-y-1">
              <NavLink to="/fact-check" className={linkClass} onClick={() => setOpen(false)}>Fact Check</NavLink>
              <NavLink to="/amatangazo" className={linkClass} onClick={() => setOpen(false)}>
                🗞️ Amatangazo
              </NavLink>
              <NavLink to="/advertise" onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm font-bold bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors">
                📢 Tangaza kuri Imboni
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
