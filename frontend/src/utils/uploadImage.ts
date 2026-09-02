import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { compressImage } from './imageCompression';

export const uploadImageToStorage = async (file: File, folder: string, id: string): Promise<string> => {
    try {
        // Compress the image before upload
        const compressedFile = await compressImage(file, 800, 800, 0.8);
        
        // Ensure a safe file name (e.g. image.jpg)
        const ext = file.name.split('.').pop() || 'jpg';
        const safeName = `image_${Date.now()}.${ext}`;
        
        const storageRef = ref(storage, `${folder}/${id}/${safeName}`);
        
        await uploadBytes(storageRef, compressedFile);
        const downloadUrl = await getDownloadURL(storageRef);
        
        return downloadUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};
