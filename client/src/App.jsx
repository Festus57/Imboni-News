import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import api from './services/api.js';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import NewsDetails from './pages/NewsDetails.jsx';
import CategoryNews from './pages/CategoryNews.jsx';
import SearchResults from './pages/SearchResults.jsx';
import DistrictNews from './pages/DistrictNews.jsx';
import ImboniTV from './pages/ImboniTV.jsx';
import VideoDetail from './pages/VideoDetail.jsx';
import LiveNews from './pages/LiveNews.jsx';
import Shorts from './pages/Shorts.jsx';
import FactCheck from './pages/FactCheck.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import AdvertiseWithUs from './pages/AdvertiseWithUs.jsx';
import Amatangazo from './pages/Amatangazo.jsx';
import Login from './pages/reader/Login.jsx';
import Register from './pages/reader/Register.jsx';
import ReaderDashboard from './pages/reader/ReaderDashboard.jsx';
import SavedArticles from './pages/reader/SavedArticles.jsx';
import Profile from './pages/reader/Profile.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

export default function App() {
  const location = useLocation();

  // Track every page visit silently
  useEffect(() => {
    api.post('/analytics/visit').catch(() => {});
  }, [location.pathname]);

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/amakuru/:slug" element={<NewsDetails />} />
        <Route path="/category/:slug" element={<CategoryNews />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/akarere/:district" element={<DistrictNews />} />
        <Route path="/imboni-tv" element={<ImboniTV />} />
        <Route path="/imboni-tv/:slug" element={<VideoDetail />} />
        <Route path="/live" element={<LiveNews />} />
        <Route path="/shorts" element={<Shorts />} />
        <Route path="/fact-check" element={<FactCheck />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/advertise" element={<AdvertiseWithUs />} />
        <Route path="/amatangazo" element={<Amatangazo />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Reader — protected */}
        <Route path="/dashboard" element={<ProtectedRoute><ReaderDashboard /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedArticles /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
