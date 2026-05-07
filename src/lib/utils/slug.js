export function slugify(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '');
}

export function withShortHash(slug) {
  const hash = Math.random().toString(36).slice(2, 8);
  const base = slug || 'topic';
  return `${base}-${hash}`;
}
