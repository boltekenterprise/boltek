import { useEffect, useState } from 'react';
import { fetchAndCacheImage } from '../lib/imageCache';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export default function CachedImg({ src, alt, ...rest }: Props) {
  const [objUrl, setObjUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let created: string | null = null;
    if (!src) return;
    fetchAndCacheImage(src).then(url => {
      if (!active) return;
      created = url;
      setObjUrl(url);
    }).catch(err => {
      // fallback: use original src
      if (active) setObjUrl(src);
    });
    return () => {
      active = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [src]);

  return <img src={objUrl || src} alt={alt} {...rest} />;
}
