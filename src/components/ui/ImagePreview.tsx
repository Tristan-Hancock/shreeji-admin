import { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImagePreviewProps {
  url: string | null | undefined;
  alt?: string;
  className?: string;
}

/**
 * Renders a URL-based image with a consistent neutral placeholder
 * when the URL is empty or the image fails to load.
 * Resets the error state whenever `url` changes.
 */
export default function ImagePreview({ url, alt = 'Image', className }: ImagePreviewProps) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [url]);

  if (!url || errored) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-neutral-100',
          className,
        )}
      >
        <ImageOff className="w-6 h-6 text-neutral-300" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      onError={() => setErrored(true)}
      className={cn('object-cover', className)}
    />
  );
}
