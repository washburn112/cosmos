import { storage } from '../firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';

export const storageService = {
  // Upload a file to Firebase Storage
  async uploadFile(file, path) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return {
        path: snapshot.ref.fullPath,
        url: downloadURL,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Get download URL for a file
  async getFileUrl(path) {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  },

  // Delete a file from Firebase Storage
  async deleteFile(path) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // List all files in a directory
  async listFiles(path) {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      const files = await Promise.all(
        result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return {
            name: item.name,
            path: item.fullPath,
            url,
          };
        })
      );
      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  },
}; 