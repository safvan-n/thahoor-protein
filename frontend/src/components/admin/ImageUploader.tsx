import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, X, FileImage, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
    currentImage?: string;
    onFileSelect: (file: File | null) => void;
    isUploading?: boolean;
}

export function ImageUploader({ currentImage, onFileSelect, isUploading = false }: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): boolean => {
        setError(null);
        
        // 1. Validate Type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Only JPG, PNG, and WebP are allowed.');
            return false;
        }

        // 2. Validate Size (Max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('File is too large. Maximum size is 2MB.');
            return false;
        }

        return true;
    };

    const handleFile = (file: File) => {
        if (!validateFile(file)) return;
        
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        onFileSelect(file);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleRemove = () => {
        setPreview(null);
        onFileSelect(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full">
            {error && (
                <div className="mb-2 text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-2">
                    <X size={14} className="cursor-pointer" onClick={() => setError(null)} />
                    {error}
                </div>
            )}
            
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all overflow-hidden bg-gray-50
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
                    ${preview ? 'border-none' : ''}`}
            >
                {isUploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-primary mb-2" size={32} />
                        <p className="text-sm font-bold text-gray-700">Uploading...</p>
                    </div>
                )}

                {preview ? (
                    <div className="relative w-full h-full group">
                        <img src={preview} alt="Preview" className="w-full h-full object-contain bg-gray-100" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-white text-gray-900 font-bold text-xs rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                                disabled={isUploading}
                            >
                                Replace
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="px-4 py-2 bg-red-500 text-white font-bold text-xs rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                                disabled={isUploading}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
                            <FileImage className="text-gray-400" size={24} />
                        </div>
                        <p className="text-sm font-bold text-gray-700">Click or drag image here</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 2MB</p>
                    </div>
                )}
                
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleChange}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                />
            </div>
        </div>
    );
}
