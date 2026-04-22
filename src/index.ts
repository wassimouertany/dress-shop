require('dotenv').config();

import express from 'express';
import cors from 'cors';
import { connectDb } from './database';
import {
  productRoutes,
  authRoutes,
  cartRoutes,
  categoryRoutes,
  addressRoutes,
  paymentRoutes,
  livraisonRoutes,
  orderRoutes,
  reviewRoutes,
  userRoutes,
  dashboardRoutes,
  wishlistRoutes,
} from './routes';
import { PORT } from './config';
import passport from 'passport';
import bodyParser from 'body-parser';

// initialize passport
require('./lib/passport');

const app = express();

const start = async () => {
  // connect to db
  await connectDb();

  app.use(cors());
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
  app.use(passport.initialize());

  // setup routes
  app.use('/api/auth', authRoutes);
  app.use('/api/addresses', addressRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/livraisons', livraisonRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
};

start();
