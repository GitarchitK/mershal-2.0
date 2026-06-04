export function getFeaturedImageUrl(img: string | null | undefined): string {
  if (!img) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800';
  }
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }
  if (img.startsWith('/')) {
    return img;
  }
  if (img.startsWith('images/')) {
    return `/${img}`;
  }
  return `/images/articles/${img}`;
}
