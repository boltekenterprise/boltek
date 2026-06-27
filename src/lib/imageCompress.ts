/**
 * Compress an image File in the browser using a canvas and return a new File (WebP).
 * quality: 0..1 (0.7 = 70%)
 * maxDim: maximum width or height in px
 */
export async function compressImage(file: File, quality = 0.7, maxDim = 1200): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (!width || !height) return resolve(file);
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const newName = (file.name || 'image').replace(/\.[^/.]+$/, '') + '.webp';
            const compressed = new File([blob], newName, { type: 'image/webp', lastModified: Date.now() });
            resolve(compressed);
          } else resolve(file);
        }, 'image/webp', quality);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
