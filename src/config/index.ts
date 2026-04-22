export const IS_PROD = process.env.NODE_ENV === 'production';
export const PORT = process.env.PORT || 5000;
export const DATABASE_URI = process.env.DATABASE_URI;
export const JWT_SECRET_KEY = `${process.env.JWT_SECRET}`;
export const JWT_EXPIRES_IN = '7d';
export const CLIENT_PUBLIC_URL = `${process.env.CLIENT_PUBLIC_URL}`;
