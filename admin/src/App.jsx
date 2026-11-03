import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Login from './pages/auth/Login.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import ArticleList from './pages/articles/ArticleList.jsx';
import CreateArticle from './pages/articles/CreateArticle.jsx';
import EditArticle from './pages/articles/EditArticle.jsx';
import ReviewArticles from './pages/articles/ReviewArticles.jsx';
import Categories from './pages/categories/Categories.jsx';
import VideoList from './pages/videos/VideoList.jsx';
import UploadVideo from './pages/videos/UploadVideo.jsx';
import LiveStreams from './pages/videos/LiveStreams.jsx';
import AdDashboard from './pages/advertisements/AdDashboard.jsx';
import Advertisers from './pages/advertisements/Advertisers.jsx';
import AdCampaigns from './pages/advertisements/AdCampaigns.jsx';
import AdRequests from './pages/advertisements/AdRequests.jsx';
import Invoices from './pages/advertisements/Invoices.jsx';
import Kwamamaza from './pages/advertisements/Kwamamaza.jsx';
import Amatangazo from './pages/advertisements/Amatangazo.jsx';
import StaffUsers from './pages/users/StaffUsers.jsx';
import Readers from './pages/users/Readers.jsx';
import Analytics from './pages/analytics/Analytics.jsx';
import MediaLibrary from './pages/media/MediaLibrary.jsx';
import Loader from './components/Loader.jsx';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="articles" element={<ArticleList />} />
        <Route path="articles/create" element={<CreateArticle />} />
        <Route path="articles/:id/edit" element={<EditArticle />} />
        <Route path="articles/review" element={<ProtectedRoute roles={['super_admin','admin','editor']}><ReviewArticles /></ProtectedRoute>} />
        <Route path="categories" element={<ProtectedRoute roles={['super_admin','admin']}><Categories /></ProtectedRoute>} />
        <Route path="videos" element={<VideoList />} />
        <Route path="videos/upload" element={<UploadVideo />} />
        <Route path="videos/edit/:id" element={<UploadVideo />} />
        <Route path="videos/live" element={<LiveStreams />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="ads" element={<AdDashboard />} />
        <Route path="ads/amatangazo" element={<Amatangazo />} />
        <Route path="ads/advertisers" element={<Advertisers />} />
        <Route path="ads/campaigns" element={<AdCampaigns />} />
        <Route path="ads/requests" element={<AdRequests />} />
        <Route path="ads/kwamamaza" element={<Kwamamaza />} />
        <Route path="ads/invoices" element={<Invoices />} />
        <Route path="users/staff" element={<ProtectedRoute roles={['super_admin','admin']}><StaffUsers /></ProtectedRoute>} />
        <Route path="users/readers" element={<ProtectedRoute roles={['super_admin','admin']}><Readers /></ProtectedRoute>} />
        <Route path="analytics" element={<ProtectedRoute roles={['super_admin','admin']}><Analytics /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
