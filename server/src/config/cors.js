const configuredOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL]
  .filter(Boolean)
  .flatMap((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean));

const allowedOrigins = configuredOrigins.length
  ? configuredOrigins
  : ['http://localhost:5173', 'http://localhost:5174'];

export const corsOptions = {
  origin: (origin, callback) => {
    // Requests without Origin are typically server-to-server or local CLI calls.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};
