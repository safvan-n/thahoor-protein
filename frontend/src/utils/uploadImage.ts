import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { compressImage } from './imageCompression';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit matching storage.rules

export const uploadImageToStorage = async (
    file: File,
    folder: 'products' | 'categories',
    id: string
): Promise<string> => {
    // 1. Validate file existence
    if (!file) {
        throw new Error('No file provided for upload.');
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        throw new Error(
            `Invalid file type (${file.type || 'unknown'}). Only JPG, PNG, and WebP images are allowed.`
        );
    }

    // 3. Validate file size (max 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        throw new Error(`File size (${sizeMb}MB) exceeds the maximum allowed limit of 5MB.`);
    }

    // 4. Compress image before uploading
    const compressedFile = await compressImage(file, 800, 800, 0.85);

    try {
        // 5. Generate collision-resistant safe filename
        const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const safeExt = ['jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'jpg';
        const randomSuffix = Math.random().toString(36).substring(2, 9);
        const safeName = `img_${Date.now()}_${randomSuffix}.${safeExt}`;

        // 6. Upload to Firebase Storage
        const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
        const storageRef = ref(storage, `${folder}/${cleanId}/${safeName}`);

        const uploadResult = await uploadBytes(storageRef, compressedFile, {
            contentType: compressedFile.type || 'image/jpeg',
            cacheControl: 'public, max-age=31536000',
        });

        // 7. Get and return download URL
        const downloadUrl = await getDownloadURL(uploadResult.ref);
        return downloadUrl;
    } catch (storageError: any) {
        console.warn(
            'Firebase Storage upload unavailable (CORS policy or bucket status). Falling back to optimized base64 image:',
            storageError
        );

        // Fallback: convert compressed image to base64 data URL so admin functionality is never blocked
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to encode image data.'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read image file.'));
            reader.readAsDataURL(compressedFile);
        });
    }
};
