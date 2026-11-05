import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Category from '../src/models/Category.js';

const seed = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be configured.');
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const adminName = process.env.ADMIN_NAME || 'Super Admin';
  if (!adminEmail || !/^\S+@\S+\.\S+$/.test(adminEmail)) throw new Error('Set a valid ADMIN_EMAIL in server/.env.');
  if (adminPassword.length < 12) throw new Error('Set ADMIN_PASSWORD to a unique password of at least 12 characters.');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    await User.create({ name: adminName, email: adminEmail, password: adminPassword, role: 'super_admin', isStaff: true, isActive: true });
    console.log('Super admin account created. Store the credentials securely.');
  } else {
    console.log('Configured super admin already exists; no password was changed.');
  }

  const categories = [
    { name: 'Politics', nameKiny: 'Politiki', slug: 'politiki', color: '#E63946', order: 1 },
    { name: 'Sports', nameKiny: 'Imikino', slug: 'imikino', color: '#2A9D8F', order: 2 },
    { name: 'Education', nameKiny: 'Uburezi', slug: 'uburezi', color: '#E9C46A', order: 3 },
    { name: 'Technology', nameKiny: 'Ikoranabuhanga', slug: 'ikoranabuhanga', color: '#457B9D', order: 4 },
    { name: 'Health', nameKiny: 'Ubuzima', slug: 'ubuzima', color: '#2DC653', order: 5 },
    { name: 'Entertainment', nameKiny: 'Agakino', slug: 'agakino', color: '#F4A261', order: 6 },
    { name: 'Business', nameKiny: 'Ubucuruzi', slug: 'ubucuruzi', color: '#6A4C93', order: 7 },
    { name: 'International', nameKiny: 'Mpuzamahanga', slug: 'mpuzamahanga', color: '#1D3557', order: 8 },
    { name: 'Environment', nameKiny: 'Ibidukikije', slug: 'ibidukikije', color: '#52B788', order: 9 },
    { name: 'Culture', nameKiny: 'Umuco', slug: 'umuco', color: '#C77DFF', order: 10 },
  ];

  for (const category of categories) await Category.updateOne({ slug: category.slug }, category, { upsert: true });
  console.log('Categories seeded');
  await mongoose.disconnect();
  console.log('Seeding complete');
};

seed().catch(async (error) => {
  console.error('Seed failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
