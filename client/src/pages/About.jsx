import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <Helmet><title>Ibyerekeye twe — Imboni News</title></Helmet>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ibyerekeye Imboni News</h1>
        <div className="w-16 h-1 bg-primary mb-6" />

        <div className="prose prose-lg text-gray-700 space-y-4">
          <p>
            <strong>Imboni News</strong> ni urubuga rw'amakuru rw'icyiciro cya mbere mu Rwanda, rugamije gutanga amakuru y'ukuri, yihuse, kandi yerekeye buri muntu.
          </p>
          <p>
            Turangamira gutanga amakuru y'isi yose, politiki, imikino, ubuzima, ikoranabuhanga, ubucuruzi, umuco n'ibindi — mu magambo, video, n'amajwi.
          </p>
          <p>
            Isubirano ryacu ni ukugira <strong>Imboni TV</strong>, aho abashyitsi bashobora kureba video z'amakuru, gukurikira gusohora kuri LIVE, no kureba Shorts zihuriweho n'amakuru manini.
          </p>
          <p>
            Tukora twungukiranyije n'inzobere zo mu Rwanda no hanze, kugirango tuzane amakuru y'ukuri, yigenzuwe, kuri buri muturage.
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          <Link to="/contact" className="btn-primary">Twandikire</Link>
          <Link to="/advertise" className="btn-secondary">Tangaza kuri Imboni</Link>
        </div>
      </div>
    </>
  );
}
