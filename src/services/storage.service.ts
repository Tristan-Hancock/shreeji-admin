import { supabase } from '../lib/supabase';

const BUCKET = 'product-images';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export class StorageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageValidationError';
  }
}

export function validateImageFile(file: File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new StorageValidationError(
      `Invalid file type "${file.type}". Allowed types: JPEG, PNG, WebP, GIF.`
    );
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new StorageValidationError(
      `File is too large (${sizeMB} MB). Maximum allowed size is 5 MB.`
    );
  }
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildStoragePath(folder: string, file: File): string {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const sanitized = sanitizeFilename(baseName);
  const uuid = crypto.randomUUID();
  return `${folder}/${uuid}-${sanitized}.${ext}`;
}

async function uploadImage(folder: string, file: File): Promise<string> {
  validateImageFile(file);

  const path = buildStoragePath(folder, file);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export const StorageService = {
  uploadCategoryImage: (file: File): Promise<string> => uploadImage('categories', file),
  uploadProductImage: (file: File): Promise<string> => uploadImage('products', file),
};
