import Stripe from 'stripe';
import dotenv from 'dotenv';

// Ensure env vars are loaded if this file is accessed directly
dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('FATAL ERROR: STRIPE_SECRET_KEY is missing in .env');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Pinning the version ensures stability
});

export default stripe;