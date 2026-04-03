import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Category } from '../types';
import { db } from '../lib/firebase';
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc,
} from 'firebase/firestore';

interface CategoryState {
    categories: Category[];
    fetchCategories: () => Promise<void>;
    addCategory: (category: Category) => Promise<void>;
    updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>()(
    persist(
        (set) => ({
            categories: [],

            fetchCategories: async () => {
                try {
                    const categoriesCol = collection(db, 'categories');
                    const categorySnapshot = await getDocs(categoriesCol);
                    const categoryList = categorySnapshot.docs.map(doc => ({
                        ...doc.data(),
                        id: doc.id
                    })) as Category[];
                    
                    set({ categories: categoryList });
                } catch (error) {
                    console.error('Failed to fetch categories from Firestore:', error);
                }
            },

            addCategory: async (category) => {
                try {
                    const categoriesCol = collection(db, 'categories');
                    const { id, ...categoryData } = category;
                    const docRef = await addDoc(categoriesCol, categoryData);
                    
                    const newCategory = { ...category, id: docRef.id };
                    set((state) => ({
                        categories: [...state.categories, newCategory],
                    }));
                } catch (error) {
                    console.error('Failed to add category to Firestore:', error);
                }
            },

            updateCategory: async (id, updates) => {
                try {
                    const categoryRef = doc(db, 'categories', id);
                    await updateDoc(categoryRef, updates);
                    set((state) => ({
                        categories: state.categories.map((c) =>
                            c.id === id ? { ...c, ...updates } : c
                        ),
                    }));
                } catch (error) {
                    console.error('Failed to update category in Firestore:', error);
                }
            },

            deleteCategory: async (id) => {
                try {
                    const categoryRef = doc(db, 'categories', id);
                    await deleteDoc(categoryRef);
                    set((state) => ({
                        categories: state.categories.filter((c) => c.id !== id),
                    }));
                } catch (error) {
                    console.error('Failed to delete category from Firestore:', error);
                }
            },
        }),
        {
            name: 'category-storage',
        }
    )
);
