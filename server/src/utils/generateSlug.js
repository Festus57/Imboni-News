import slugify from 'slugify';

export const generateSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'rw',
  });
};

export const generateUniqueSlug = async (text, Model, existingId = null) => {
  let slug = generateSlug(text);
  let count = 0;
  let uniqueSlug = slug;

  while (true) {
    const query = { slug: uniqueSlug };
    if (existingId) query._id = { $ne: existingId };
    const existing = await Model.findOne(query);
    if (!existing) break;
    count++;
    uniqueSlug = `${slug}-${count}`;
  }

  return uniqueSlug;
};
