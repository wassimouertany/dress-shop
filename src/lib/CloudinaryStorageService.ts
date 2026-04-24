import { Cloudinary } from './cloudinary';
import { IStorageService, UploadOptions } from '../interfaces/IStorageService';

export class CloudinaryStorageService implements IStorageService {
  upload(
    buffer: Buffer,
    folder: 'products' | 'categories',
    options: UploadOptions
  ): Promise<string> {
    return Cloudinary.uploadBuffer(buffer, folder, options);
  }
}