import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOrderConfirmation = async (order, user) => {
  try {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}x ${item.menuItem?.name || 'Item'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.priceAtPurchase || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Crave Orders" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Order Confirmed! #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #FF4500; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">Order Confirmed!</h1>
            <p>Your food is being prepared.</p>
          </div>
          
          <div style="padding: 20px;">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Thank you for ordering with Crave. Your order <strong>#${order.orderNumber}</strong> has been received.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Estimated Pickup:</strong> ${new Date(order.estimatedPickupTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> Paid & Preparing</p>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #eee;">
                  <th style="padding: 10px; text-align: left;">Item</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding: 10px; font-weight: bold;">Total Paid</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold;">₹${order.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background-color: #333; color: white; text-align: center; padding: 15px; font-size: 12px;">
            <p>&copy; 2025 Crave Food Technologies. All rights reserved.</p>
            <p>Please show this email at the counter to collect your order.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};