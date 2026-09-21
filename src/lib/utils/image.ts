export const getImageUrl = (image: any): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || '';
};
