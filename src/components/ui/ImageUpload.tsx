import { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, ImageOff, X, RefreshCcw, Loader2 } from 'lucide-react';
import { StorageValidationError } from '../../services/storage.service';
import { cn } from '../../lib/utils';

type UploadPhase = 'idle' | 'uploading' | 'validation-error' | 'upload-error';

interface ImageUploadProps {
  /** Current committed image URL (from the database) */
  value?: string | null;
  /** Called with the new public URL after a successful upload, or null when removed */
  onChange: (url: string | null) => void;
  /** Upload function — receives the File, returns the public URL */
  onUpload: (file: File) => Promise<string>;
  /** CSS aspect-ratio value, e.g. "16/9" or "1". Defaults to "1" (square). */
  aspectRatio?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onUpload,
  aspectRatio = '1',
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  /** Blob URL created during upload for instant local preview */
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const pendingFileRef = useRef<File | null>(null);

  // Clean up blob URL when the component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const processFile = useCallback(
    async (file: File) => {
      // Revoke any previous local preview
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
        setLocalPreview(null);
      }

      // Instant local preview
      const blobUrl = URL.createObjectURL(file);
      setLocalPreview(blobUrl);
      pendingFileRef.current = file;
      setPhase('uploading');
      setErrorMessage('');

      try {
        const publicUrl = await onUpload(file);
        // Revoke the local blob URL — we now have the real URL
        URL.revokeObjectURL(blobUrl);
        setLocalPreview(null);
        pendingFileRef.current = null;
        onChange(publicUrl);
        setPhase('idle');
      } catch (err) {
        if (err instanceof StorageValidationError) {
          URL.revokeObjectURL(blobUrl);
          setLocalPreview(null);
          pendingFileRef.current = null;
          setErrorMessage(err.message);
          setPhase('validation-error');
        } else {
          // Keep local preview so user can retry
          setErrorMessage(
            err instanceof Error ? err.message : 'Upload failed. Please try again.'
          );
          setPhase('upload-error');
        }
      }
    },
    [localPreview, onChange, onUpload]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset the input so the same file can be re-selected after removal
    e.target.value = '';
  };

  const handleRetry = () => {
    const file = pendingFileRef.current;
    if (file) processFile(file);
  };

  const handleRemove = () => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
    pendingFileRef.current = null;
    setPhase('idle');
    setErrorMessage('');
    onChange(null);
  };

  const openPicker = () => inputRef.current?.click();

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const displayUrl = localPreview ?? value;
  const hasImage = Boolean(displayUrl);
  const isUploading = phase === 'uploading';
  const hasError = phase === 'validation-error' || phase === 'upload-error';

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
        capture={undefined}
      />

      {/* Drop zone / image container */}
      <div
        style={{ aspectRatio }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={hasImage ? undefined : openPicker}
        className={cn(
          'relative w-full rounded-xl overflow-hidden border-2 transition-colors duration-200',
          hasImage
            ? 'border-transparent'
            : isDragging
            ? 'border-emerald-400 bg-emerald-50 cursor-pointer'
            : 'border-dashed border-neutral-300 bg-neutral-50 hover:border-emerald-400 hover:bg-emerald-50/50 cursor-pointer'
        )}
      >
        {hasImage ? (
          <>
            {/* Image */}
            <img
              src={displayUrl!}
              alt="Preview"
              className={cn(
                'w-full h-full object-cover',
                isUploading && 'opacity-60'
              )}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty('display', 'flex');
              }}
            />
            {/* Fallback icon (hidden by default, shown on img load error) */}
            <div
              className="absolute inset-0 hidden items-center justify-center bg-neutral-100"
              style={{ display: 'none' }}
            >
              <ImageOff className="w-8 h-8 text-neutral-400" />
            </div>

            {/* Uploading overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="flex flex-col items-center gap-2 text-white">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <span className="text-xs font-medium">Uploading…</span>
                </div>
              </div>
            )}

            {/* Error overlay */}
            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-3">
                <div className="flex flex-col items-center gap-2 text-white text-center">
                  <span className="text-xs font-medium leading-snug">{errorMessage}</span>
                  {phase === 'upload-error' && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRetry(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-neutral-800 rounded-lg text-xs font-bold hover:bg-neutral-100 transition-colors"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                      Retry
                    </button>
                  )}
                  {phase === 'validation-error' && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); openPicker(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-neutral-800 rounded-lg text-xs font-bold hover:bg-neutral-100 transition-colors"
                    >
                      Choose Another
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Change / Remove controls — visible when idle and image is present */}
            {!isUploading && !hasError && (
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-2 bg-gradient-to-t from-black/60 to-transparent">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openPicker(); }}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-md text-xs font-semibold transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                  className="p-1 bg-white/20 hover:bg-red-500/80 backdrop-blur-sm text-white rounded-md transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty state — drop zone */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 select-none">
            {hasError ? (
              <>
                <span className="text-xs text-red-600 text-center font-medium leading-snug">{errorMessage}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openPicker(); }}
                  className="mt-1 px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Choose File
                </button>
              </>
            ) : (
              <>
                <div className={cn(
                  'p-3 rounded-full transition-colors',
                  isDragging ? 'bg-emerald-100' : 'bg-neutral-200'
                )}>
                  <Upload className={cn(
                    'w-5 h-5 transition-colors',
                    isDragging ? 'text-emerald-600' : 'text-neutral-500'
                  )} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-neutral-700">
                    {isDragging ? 'Drop to upload' : 'Click or drag & drop'}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">JPEG, PNG, WebP, GIF · max 5 MB</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
