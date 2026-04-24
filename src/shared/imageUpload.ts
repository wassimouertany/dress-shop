import { IStorageService, UploadOptions } from '../interfaces/IStorageService';
import { CloudinaryStorageService } from '../lib/CloudinaryStorageService';

// Implémentation par défaut : Cloudinary.
// Pour changer de provider, appeler setStorageService() au démarrage
// (dans index.ts) ou dans les tests unitaires.
let storageService: IStorageService = new CloudinaryStorageService();

export const setStorageService = (service: IStorageService): void => {
  storageService = service;
};

export const uploadImage = (
  buffer: Buffer,
  folder: 'products' | 'categories',
  dimensions: UploadOptions
): Promise<string> => storageService.upload(buffer, folder, dimensions);