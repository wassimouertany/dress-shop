export interface UploadOptions {
  width: number;
  height: number;
}

export interface IStorageService {
  upload(
    buffer: Buffer,
    folder: 'products' | 'categories',
    options: UploadOptions
  ): Promise<string>;
}