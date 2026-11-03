import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import BreakingNewsBar from './BreakingNewsBar.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <BreakingNewsBar />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
