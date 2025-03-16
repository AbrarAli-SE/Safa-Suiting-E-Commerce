// helpers/emailTemplates.js

// 1. OTP Email Template
function generateOtpEmail({ name, newOtp }) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP</title>
      </head>
      <body class="bg-[var(--color-gray-50)] text-[var(--color-black)] font-sans">
        <div class="max-w-md mx-auto p-root-5">
          <div class="bg-[var(--color-white)] card-shadow rounded-lg p-root-4 border-t-4 border-[var(--color-red-500)]">
            <h1 class="text-xl font-bold text-[var(--color-black)] mb-root-3">Your One-Time Password (OTP)</h1>
            <p class="text-[var(--color-gray-600)] mb-root-2">Hello ${name},</p>
            <p class="text-[var(--color-gray-600)] mb-root-4">Use the following OTP to complete your action. It’s valid for 10 minutes.</p>
            <div class="bg-[var(--color-gray-50)] p-root-3 rounded-lg text-center mb-root-4">
              <p class="text-2xl font-bold text-[var(--color-red-500)]">${newOtp}</p>
            </div>
            <p class="text-[var(--color-gray-600)]">If you didn’t request this, please secure your account immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  // 2. New Password Email Template
  function generateNewPasswordEmail({ name, newPassword, loginUrl = 'https://example.com/login' }) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Password</title>
      </head>
      <body class="bg-[var(--color-gray-50)] text-[var(--color-black)] font-sans">
        <div class="max-w-lg mx-auto p-root-5">
          <div class="bg-[var(--color-white)] card-shadow rounded-lg p-root-4 text-center">
            <h1 class="text-xl font-bold text-[var(--color-red-500)] mb-root-3">Your New Password</h1>
            <p class="text-[var(--color-gray-600)] mb-root-2">Hello ${name},</p>
            <p class="text-[var(--color-gray-600)] mb-root-4">Your new password has been generated. Please use it to log in and change it as soon as possible.</p>
            <p class="text-[var(--color-black)] font-semibold">New Password: <span class="text-[var(--color-red-500)] bg-[var(--color-red-50)] px-3 py-1 rounded">${newPassword}</span></p>
            <a href="${loginUrl}" target="_blank" class="btn-red inline-block mt-root-4">Log In Now</a>
            <p class="text-[var(--color-gray-600)] mt-root-4">If you didn’t request this, please contact support.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  // 3. Shipment Notification Email Template
  function generateShipmentEmail({ name, orderId, totalAmount, trackingId, trackingUrl = `https://www.tcsexpress.com/?trackingnumber=${trackingId}` }) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shipment Notification</title>
      </head>
      <body class="bg-[var(--color-gray-50)] text-[var(--color-black)] font-sans">
        <div class="max-w-3xl mx-auto p-root-5">
          <div class="bg-[var(--color-red-500)] text-[var(--color-white)] p-root-4 rounded-t-lg">
            <h1 class="text-2xl font-bold">Your Order ${orderId} Has Been Shipped!</h1>
          </div>
          <div class="bg-[var(--color-white)] card-shadow rounded-b-lg p-root-4">
            <p class="text-[var(--color-gray-600)] mb-root-3">Dear ${name},</p>
            <p class="text-[var(--color-gray-600)] mb-root-4">Great news! Your order has been shipped. Below are the details:</p>
            <div class="border-t border-[var(--color-gray-300)] pt-root-3 mb-root-4">
              <p class="text-[var(--color-black)] font-semibold">Order ID: <span class="text-[var(--color-red-500)]">${orderId}</span></p>
              <p class="text-[var(--color-black)] font-semibold">Total Amount: <span class="text-[var(--color-red-500)]">Rs ${totalAmount.toFixed(2)}</span></p>
              <p class="text-[var(--color-black)] font-semibold">Tracking ID: <span class="text-[var(--color-red-500)]">${trackingId}</span></p>
              <p class="text-[var(--color-gray-600)] mt-root-2">Track your order here:</p>
              <a href="${trackingUrl}" target="_blank" class="btn-red inline-block mt-root-2">Track Your Order</a>
            </div>
            <p class="text-[var(--color-gray-600)]">Thank you for shopping with us! If you have any questions, feel free to reach out.</p>
            <p class="text-[var(--color-gray-600)] mt-root-2">Best regards,<br>Safa Suiting</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  // 4. Order Confirmation Email Template
  function generateOrderConfirmationEmail({ order }) {
    const itemsHtml = order.items.map(item => `
      <tr class="border-b border-[var(--color-gray-300)]">
        <td class="p-root-2">${item.name}</td>
        <td class="p-root-2">${item.quantity}</td>
        <td class="p-root-2">Rs ${item.price.toFixed(2)}</td>
        <td class="p-root-2">Rs ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');
  
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body class="bg-[var(--color-gray-50)] text-[var(--color-black)] font-sans">
        <div class="max-w-2xl mx-auto p-root-5">
          <div class="bg-[var(--color-white)] card-shadow rounded-lg p-root-4">
            <h1 class="text-2xl font-bold text-[var(--color-red-500)] mb-root-3">Order Confirmation - ${order.orderId}</h1>
            <p class="text-[var(--color-gray-600)] mb-root-4">Thank you for your order! Here are the details:</p>
            <div class="border-t border-[var(--color-gray-300)] pt-root-3">
              <h2 class="text-lg font-semibold text-[var(--color-black)] mb-root-2">Items Ordered</h2>
              <table class="w-full text-left mb-root-4">
                <thead>
                  <tr class="bg-[var(--color-gray-50)]">
                    <th class="p-root-2">Item</th>
                    <th class="p-root-2">Qty</th>
                    <th class="p-root-2">Price</th>
                    <th class="p-root-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <div class="text-left">
                <p class="text-[var(--color-gray-600)]">Subtotal: <span class="font-semibold">Rs ${order.subtotal.toFixed(2)}</span></p>
                <p class="text-[var(--color-gray-600)]">Shipping: <span class="font-semibold">Rs ${order.shipping.toFixed(2)}</span></p>
                <p class="text-[var(--color-gray-600)]">Tax: <span class="font-semibold">Rs ${order.tax.toFixed(2)}</span></p>
                <p class="text-[var(--color-black)] font-bold">Total: <span class="text-[var(--color-red-500)]">Rs ${order.totalAmount.toFixed(2)}</span></p>
              </div>
            </div>
            <div class="mt-root-4 border-t border-[var(--color-gray-300)] pt-root-3">
              <h2 class="text-lg font-semibold text-[var(--color-black)] mb-root-2">Billing Information</h2>
              <p class="text-[var(--color-gray-600)]">${order.billingInfo.firstName}</p>
              <p class="text-[var(--color-gray-600)]">${order.billingInfo.streetAddress}${order.billingInfo.apartment ? ', ' + order.billingInfo.apartment : ''}</p>
              <p class="text-[var(--color-gray-600)]">${order.billingInfo.townCity}</p>
              <p class="text-[var(--color-gray-600)]">Phone: ${order.billingInfo.phoneNumber}</p>
              <p class="text-[var(--color-gray-600)]">Email: ${order.billingInfo.emailAddress}</p>
              <p class="text-[var(--color-gray-600)]">Payment Method: ${order.paymentMethod}</p>
            </div>
            <div class="mt-root-4 bg-[var(--color-red-50)] p-root-3 rounded-md">
              <p class="text-[var(--color-red-500)] font-semibold">Tracking Information</p>
              <p class="text-[var(--color-gray-600)]">Your tracking ID will be assigned soon. We’ll notify you once your order is shipped with the tracking details.</p>
            </div>
            <p class="mt-root-4 text-[var(--color-gray-600)]">Thank you for shopping with us! If you have any questions, feel free to contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  // Export all templates
  module.exports = {
    generateOtpEmail,
    generateNewPasswordEmail,
    generateShipmentEmail,
    generateOrderConfirmationEmail
  };