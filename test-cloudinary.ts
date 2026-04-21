import cloudinary from 'cloudinary';
require('dotenv').config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const test = async () => {
  try {
    // Petite image rouge 1x1 pixel en base64
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';

    const res = await cloudinary.v2.uploader.upload(base64Image, {
      folder: 'test',
    });

    console.log('✅ Upload réussi:', res.secure_url);
  } catch (error) {
    console.log('❌ Erreur:', error);
  }
};

test();