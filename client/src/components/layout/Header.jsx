import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiLogOut, FiBookmark, FiBell, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

export default function Header() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSugg, setLoadingSugg] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Live suggestions as user types
  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoadingSugg(true);
      try {
        const res = await api.get('/articles', { params: { search: search.trim(), limit: 5 } });
        setSuggestions(res.data.data.articles || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
      finally { setLoadingSugg(false); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    setSearch('');
  };

  const handleSuggestionClick = (article) => {
    setShowSuggestions(false);
    setSearch('');
    navigate(`/amakuru/${article.slug}`);
  };

  const handleClear = () => {
    setSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <header className="bg-secondary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 flex-shrink-0">
          <span className="text-2xl font-bold text-primary">IMBONI</span>
          <span className="text-2xl font-bold text-white">NEWS</span>
        </Link>

        {/* Search bar — desktop */}
        <div ref={wrapperRef} className="flex-1 max-w-xl hidden sm:block relative">
          <form onSubmit={handleSearch}>
            <div className="flex items-center bg-white/10 hover:bg-white/15 focus-within:bg-white rounded-xl transition-colors overflow-hidden">
              <FiSearch className="ml-3 text-white/60 flex-shrink-0 focus-within:text-gray-500" size={16} />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => suggestions.length && setShowSuggestions(true)}
                placeholder="Shakisha inkuru, video, ibyiciro..."
                className="flex-1 px-3 py-2.5 bg-transparent text-white placeholder-white/50 focus:text-gray-900 focus:placeholder-gray-400 text-sm focus:outline-none"
                aria-label="Shakisha"
                autoComplete="off"
              />
              {search && (
                <button type="button" onClick={handleClear}
                  className="px-2 text-white/50 hover:text-white focus:text-gray-500">
                  <FiX size={15} />
                </button>
              )}
              <button type="submit"
                className="bg-primary hover:bg-red-700 text-white px-3 py-2.5 flex-shrink-0 transition-colors">
                <FiSearch size={16} />
              </button>
            </div>
          </form>

          {/* Live suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-80 overflow-y-auto">
              {loadingSugg ? (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">Gushakisha...</div>
              ) : suggestions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">Nta bisubizo</div>
              ) : (
                <>
                  <div className="px-3 py-2 bg-gray-50 border-b">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Inkuru {suggestions.length} zabonetse</p>
                  </div>
                  {suggestions.map((a) => (
                    <button
                      key={a._id}
                      onClick={() => handleSuggestionClick(a)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-0"
                    >
                      {a.featuredImage ? (
                        <img src={a.featuredImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400 text-sm">📰</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{a.title}</p>
                        {a.category && (
                          <p className="text-xs text-primary">{a.category.nameKiny}</p>
                        )}
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={handleSearch}
                    className="w-full px-4 py-2.5 text-sm text-primary font-medium bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiSearch size={13} /> Reba ibisubizo byose kuri "{search}"
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* User area */}
        <div className="flex items-center gap-2 ml-auto relative flex-shrink-0">
          {user ? (
            <>
              <Link to="/saved" className="hover:text-primary p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Ibihungitswe">
                <FiBookmark size={18} />
              </Link>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-1.5 hover:text-primary text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <FiUser size={16} />
                <span className="hidden md:block text-xs font-medium">{user.name.split(' ')[0]}</span>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-10 bg-white text-gray-900 rounded-xl shadow-xl z-50 w-48 overflow-hidden border border-gray-100">
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link to="/dashboard" onClick={() => setShowMenu(false)} className="block px-4 py-2.5 hover:bg-gray-50 text-sm">📊 Imboni Yanjye</Link>
                  <Link to="/saved" onClick={() => setShowMenu(false)} className="block px-4 py-2.5 hover:bg-gray-50 text-sm">🔖 Ibihungitswe</Link>
                  <Link to="/profile" onClick={() => setShowMenu(false)} className="block px-4 py-2.5 hover:bg-gray-50 text-sm">⚙️ Imiterere</Link>
                  <hr className="border-gray-100" />
                  <button onClick={() => { logout(); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 transition-colors">
                    <FiLogOut size={14} /> Sohoka
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="text-sm hover:text-primary px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">Injira</Link>
              <Link to="/register" className="text-sm bg-primary hover:bg-red-700 px-4 py-1.5 rounded-lg font-medium transition-colors">Iyandikishe</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Shakisha amakuru..."
              className="w-full pl-9 pr-3 py-2 text-gray-900 rounded-lg text-sm focus:outline-none bg-white/90"
            />
          </div>
          <button type="submit" className="bg-primary px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            <FiSearch size={15} />
          </button>
        </form>
      </div>
    </header>
  );
}
