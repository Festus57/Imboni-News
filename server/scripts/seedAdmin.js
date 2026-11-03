import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Category from '../src/models/Category.js';

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Create super admin
  const existing = await User.findOne({ email: 'admin@imboni.rw' });
  if (!existing) {
    await User.create({
      name: 'Super Admin',
      email: 'admin@imboni.rw',
      password: 'Admin@1234',
      role: 'super_admin',
      isStaff: true,
      isActive: true,
    });
    console.log('✅ Super Admin created — admin@imboni.rw / Admin@1234');
  } else {
    console.log('ℹ️  Super Admin already exists');
  }

  // Seed categories
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

  for (const cat of categories) {
    await Category.updateOne({ slug: cat.slug }, cat, { upsert: true });
  }
  console.log('✅ Categories seeded');

  await mongoose.disconnect();
  console.log('🎉 Seeding complete');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
