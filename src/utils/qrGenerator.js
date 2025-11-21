import crypto from 'crypto';

export const generatePickupHash = (orderId, userId) => {
  const secret = process.env.QR_SECRET;
  const data = `${orderId}:${userId}:${Date.now()}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

