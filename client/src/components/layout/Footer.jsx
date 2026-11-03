import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiYoutube, FiInstagram, FiMail, FiPhone } from 'react-icons/fi';
import festus from "../../assets/festus_16.png";
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-1 mb-3">
            <span className="text-xl font-bold text-primary">IMBONI</span>
            <span className="text-xl font-bold text-white">NEWS</span>
          </Link>
          <p className="text-sm leading-relaxed text-gray-400">
            Amakuru y'Igihugu n'Isi Yose. Amakuru y'ukuri, agatangaza, no kugabana ubumenyi.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Facebook" className="hover:text-primary"><FiFacebook size={20} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-primary"><FiTwitter size={20} /></a>
            <a href="#" aria-label="YouTube" className="hover:text-primary"><FiYoutube size={20} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-primary"><FiInstagram size={20} /></a>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Ibyiciro</h3>
          <ul className="space-y-2 text-sm">
            {[
              { name: 'Politiki', slug: 'politiki' },
              { name: 'Imikino', slug: 'imikino' },
              { name: 'Uburezi', slug: 'uburezi' },
              { name: 'Ikoranabuhanga', slug: 'ikoranabuhanga' },
              { name: 'Ubuzima', slug: 'ubuzima' },
              { name: 'Agakino', slug: 'agakino' },
            ].map((c) => (
              <li key={c.slug}>
                <Link to={`/category/${c.slug}`} className="hover:text-primary">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Imboni TV */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Imboni TV</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/imboni-tv" className="hover:text-primary">Video News</Link></li>
            <li><Link to="/shorts" className="hover:text-primary">Shorts</Link></li>
            <li><Link to="/live" className="hover:text-primary">Live TV</Link></li>
            <li><Link to="/fact-check" className="hover:text-primary">Fact Check</Link></li>
            <li><Link to="/amatangazo" className="hover:text-primary">🗞️ Amatangazo</Link></li>
            <li>
              <Link to="/advertise" className="hover:text-primary font-semibold text-yellow-400">
                📢 Tangaza kuri Imboni
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Imboni News</h3>
          <ul className="space-y-2 text-sm mb-4">
            <li><Link to="/about" className="hover:text-primary">Abo turi bo</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Twandikire</Link></li>
            <li><Link to="/register" className="hover:text-primary">Iyandikishe</Link></li>
          </ul>
        </div>
      </div>

      {/* Developer credit */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center gap-4">
          {/* Developer photo */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary flex-shrink-0 bg-gray-700">
              <img
                src={festus}
                alt="Developer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-primary font-bold text-lg">F</div>`;
                }}
              />
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Byakozwe na</p>
              <p className="text-primary text-sm font-bold">FESTUS_16</p>
              <p className="text-gray-400 text-xs">Software Engineer</p>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col sm:flex-row gap-3 sm:ml-4">
            <a href="mailto:writerdreaming2@gmail.com"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors">
              <FiMail size={13} /> writerdreaming2@gmail.com
            </a>
            <a href="tel:+250798713792"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors">
              <FiPhone size={13} /> +250 798 713 792
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-500 sm:ml-auto text-center sm:text-right">
            &copy; {year} Imboni News. Uburenganzira bwose bwarabitswe.
          </p>
        </div>
      </div>
    </footer>
  );
}
