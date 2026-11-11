const configuredOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL]
  .filter(Boolean)
  .flatMap((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean));

const allowedOrigins = configuredOrigins.length
  ? configuredOrigins
  : ['http://localhost:5173', 'http://localhost:5174'];

// Vercel preview deployments use dynamic subdomains — allow them in production
const isVercelPreview = (origin) => {
  if (!origin) return false;
  // Allow any subdomain of vercel.app for preview deployments
  return /^https:\/\/[a-z0-9-]+-festus57\.vercel\.app$/.test(origin) ||
         /^https:\/\/imboni-news[a-z0-9-]*\.vercel\.app$/.test(origin);
};

// Render.com internal health checks have no Origin
const isInternalRequest = (origin) => !origin;

export const corsOptions = {
  origin: (origin, callback) => {
    if (isInternalRequest(origin)) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (isVercelPreview(origin)) return callback(null, true);
    // In development, be permissive for localhost on any port
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin || '')) {
      return callback(null, true);
    }
    return callback(new Error(`Origin '${origin}' is not allowed by CORS.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};
