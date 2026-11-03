import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 — Imboni News</title></Helmet>
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
        <div className="text-7xl">😕</div>
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="text-gray-600">Urupapuro rwashakishijwe ntiruboneka.</p>
        <Link to="/" className="btn-primary mt-2">Subira Ahabanza</Link>
      </div>
    </>
  );
}
