// Email HTML templates for Nimo's Limerick
// Inline-styled for maximum email client compatibility

const BRAND = {
  bg: '#080808',
  accent: '#e94560',
  textPrimary: '#ffffff',
  textSecondary: '#b0b0b0',
  cardBg: '#141414',
  borderColor: '#2a2a2a',
  name: "Nimo's Limerick",
  phone: '+353 6243300',
  address: 'The Cross, Knocklong East, Co. Limerick, V94TY05',
};

function baseLayout(title, contentHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:Arial,Helvetica,sans-serif;color:${BRAND.textPrimary};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};">
<tr><td align="center" style="padding:20px 10px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BRAND.cardBg};border-radius:8px;overflow:hidden;">

<!-- Header -->
<tr><td style="background-color:${BRAND.accent};padding:24px 30px;text-align:center;">
  <h1 style="margin:0;font-size:28px;font-weight:bold;color:#ffffff;letter-spacing:1px;">${BRAND.name}</h1>
  <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Takeaway &amp; Delivery</p>
</td></tr>

<!-- Content -->
<tr><td style="padding:30px;">
${contentHtml}
</td></tr>

<!-- Footer -->
<tr><td style="padding:20px 30px;border-top:1px solid ${BRAND.borderColor};text-align:center;">
  <p style="margin:0 0 6px;font-size:13px;color:${BRAND.textSecondary};">Questions about your order? Call us at <a href="tel:${BRAND.phone}" style="color:${BRAND.accent};text-decoration:none;">${BRAND.phone}</a></p>
  <p style="margin:0 0 6px;font-size:12px;color:${BRAND.textSecondary};">${BRAND.address}</p>
  <p style="margin:0;font-size:11px;color:#666666;">&copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function formatCurrency(amount) {
  return '\u20AC' + (Number(amount) || 0).toFixed(2);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return 'soon';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Generate order confirmation email HTML
 * @param {Object} order - Order object with: id, items, total, type/order_type, delivery_address/address,
 *                         estimated_ready, customer_name, subtotal, discount, created_at, payment_method, notes
 * @returns {string} HTML email body
 */
function orderConfirmationEmail(order) {
  const orderType = order.order_type || order.type || 'pickup';
  const address = order.address || order.delivery_address || '';
  const customerName = order.customer_name || 'Customer';
  const items = order.items || [];

  // Build items table rows
  let itemsHtml = '';
  for (const item of items) {
    const name = item.item_name || item.name || 'Item';
    const qty = item.quantity || 1;
    const price = item.price || 0;
    itemsHtml += `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid ${BRAND.borderColor};color:${BRAND.textPrimary};font-size:14px;">${qty}x ${escapeHtml(name)}</td>
      <td style="padding:8px 0;border-bottom:1px solid ${BRAND.borderColor};color:${BRAND.textPrimary};font-size:14px;text-align:right;">${formatCurrency(price * qty)}</td>
    </tr>`;
  }

  const subtotal = order.subtotal != null ? order.subtotal : order.total;
  const discount = order.discount || 0;

  let totalsHtml = '';
  if (discount > 0) {
    totalsHtml += `
    <tr>
      <td style="padding:6px 0;color:${BRAND.textSecondary};font-size:13px;">Subtotal</td>
      <td style="padding:6px 0;color:${BRAND.textSecondary};font-size:13px;text-align:right;">${formatCurrency(subtotal)}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:${BRAND.accent};font-size:13px;">Discount</td>
      <td style="padding:6px 0;color:${BRAND.accent};font-size:13px;text-align:right;">-${formatCurrency(discount)}</td>
    </tr>`;
  }
  totalsHtml += `
    <tr>
      <td style="padding:10px 0 0;font-size:18px;font-weight:bold;color:${BRAND.textPrimary};">Total</td>
      <td style="padding:10px 0 0;font-size:18px;font-weight:bold;color:${BRAND.accent};text-align:right;">${formatCurrency(order.total)}</td>
    </tr>`;

  const deliveryInfo = orderType === 'delivery'
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background-color:${BRAND.bg};border-radius:6px;padding:16px;">
        <tr><td>
          <p style="margin:0 0 4px;font-size:12px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:1px;">Delivery To</p>
          <p style="margin:0;font-size:14px;color:${BRAND.textPrimary};">${escapeHtml(address)}</p>
        </td></tr>
       </table>`
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background-color:${BRAND.bg};border-radius:6px;padding:16px;">
        <tr><td>
          <p style="margin:0 0 4px;font-size:12px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:1px;">Collection From</p>
          <p style="margin:0;font-size:14px;color:${BRAND.textPrimary};">${BRAND.address}</p>
        </td></tr>
       </table>`;

  const content = `
  <h2 style="margin:0 0 4px;font-size:22px;color:${BRAND.textPrimary};">Order Confirmed!</h2>
  <p style="margin:0 0 20px;font-size:14px;color:${BRAND.textSecondary};">Hi ${escapeHtml(customerName)}, thank you for your order.</p>

  <!-- Order Meta -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
    <tr>
      <td style="padding:8px 12px;background-color:${BRAND.bg};border-radius:6px 0 0 6px;">
        <p style="margin:0;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;">Order #</p>
        <p style="margin:2px 0 0;font-size:16px;font-weight:bold;color:${BRAND.accent};">${order.id}</p>
      </td>
      <td style="padding:8px 12px;background-color:${BRAND.bg};">
        <p style="margin:0;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;">Date</p>
        <p style="margin:2px 0 0;font-size:14px;color:${BRAND.textPrimary};">${formatDate(order.created_at)}</p>
      </td>
      <td style="padding:8px 12px;background-color:${BRAND.bg};border-radius:0 6px 6px 0;">
        <p style="margin:0;font-size:11px;color:${BRAND.textSecondary};text-transform:uppercase;">Type</p>
        <p style="margin:2px 0 0;font-size:14px;color:${BRAND.textPrimary};text-transform:capitalize;">${orderType}</p>
      </td>
    </tr>
  </table>

  <!-- Items -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:0 0 6px;font-size:12px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${BRAND.accent};">Items</td>
      <td style="padding:0 0 6px;font-size:12px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:1px;text-align:right;border-bottom:2px solid ${BRAND.accent};">Price</td>
    </tr>
    ${itemsHtml}
    ${totalsHtml}
  </table>

  ${deliveryInfo}

  <!-- Estimated Ready -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
    <tr><td style="padding:14px;background-color:${BRAND.accent};border-radius:6px;text-align:center;">
      <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:1px;">Estimated ${orderType === 'delivery' ? 'Delivery' : 'Ready'} Time</p>
      <p style="margin:6px 0 0;font-size:20px;font-weight:bold;color:#ffffff;">${formatTime(order.estimated_ready)}</p>
    </td></tr>
  </table>

  ${order.notes ? `<p style="margin:16px 0 0;font-size:13px;color:${BRAND.textSecondary};"><strong style="color:${BRAND.textPrimary};">Notes:</strong> ${escapeHtml(order.notes)}</p>` : ''}
  ${order.payment_method ? `<p style="margin:8px 0 0;font-size:13px;color:${BRAND.textSecondary};"><strong style="color:${BRAND.textPrimary};">Payment:</strong> ${order.payment_method === 'card' ? 'Card' : 'Cash'}</p>` : ''}
  `;

  return baseLayout(`Order #${order.id} - ${BRAND.name}`, content);
}

/**
 * Generate order status update email HTML
 * @param {Object} order - Order object
 * @param {string} newStatus - One of: confirmed, preparing, ready, out_for_delivery, delivered, cancelled
 * @returns {string} HTML email body
 */
function orderStatusUpdateEmail(order, newStatus) {
  const orderType = order.order_type || order.type || 'pickup';
  const customerName = order.customer_name || 'Customer';

  const statusConfig = {
    confirmed: {
      heading: 'Order Confirmed!',
      message: 'Your order has been confirmed and will be prepared shortly.',
      color: '#27ae60',
      icon: '&#10003;',
    },
    preparing: {
      heading: 'Your Order is Being Prepared',
      message: 'Our kitchen is now working on your order.',
      color: '#f39c12',
      icon: '&#9832;',
    },
    ready: {
      heading: orderType === 'pickup' ? 'Ready for Collection!' : 'Your Order is Ready!',
      message: orderType === 'pickup'
        ? `Your order is ready for collection at ${BRAND.address}.`
        : 'Your order is ready and will be with you shortly.',
      color: '#2ecc71',
      icon: '&#10004;',
    },
    out_for_delivery: {
      heading: 'Out for Delivery!',
      message: 'Your order is on its way to you.',
      color: '#3498db',
      icon: '&#9658;',
    },
    delivered: {
      heading: 'Order Delivered!',
      message: 'Your order has been delivered. Enjoy your meal!',
      color: '#2ecc71',
      icon: '&#9733;',
    },
    cancelled: {
      heading: 'Order Cancelled',
      message: 'Your order has been cancelled. If you have questions, please contact us.',
      color: '#e74c3c',
      icon: '&#10007;',
    },
  };

  const config = statusConfig[newStatus] || {
    heading: 'Order Update',
    message: `Your order status has been updated to: ${newStatus}.`,
    color: BRAND.accent,
    icon: '&#8226;',
  };

  // Status progress bar
  const steps = ['confirmed', 'preparing', 'ready'];
  if (orderType === 'delivery') steps.push('out_for_delivery');
  steps.push('delivered');

  const currentIndex = steps.indexOf(newStatus);
  let progressHtml = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr>';
  for (let i = 0; i < steps.length; i++) {
    const isActive = i <= currentIndex;
    const label = steps[i].replace(/_/g, ' ');
    const stepColor = isActive ? BRAND.accent : BRAND.borderColor;
    const textColor = isActive ? BRAND.textPrimary : '#666666';
    progressHtml += `<td style="text-align:center;padding:4px;">
      <div style="width:24px;height:24px;border-radius:50%;background-color:${stepColor};margin:0 auto 4px;line-height:24px;font-size:12px;color:#ffffff;">${isActive ? '&#10003;' : (i + 1)}</div>
      <p style="margin:0;font-size:10px;color:${textColor};text-transform:capitalize;">${label}</p>
    </td>`;
  }
  progressHtml += '</tr></table>';

  const content = `
  <div style="text-align:center;padding:10px 0 20px;">
    <div style="width:60px;height:60px;border-radius:50%;background-color:${config.color};margin:0 auto 14px;line-height:60px;font-size:28px;color:#ffffff;">${config.icon}</div>
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.textPrimary};">${config.heading}</h2>
    <p style="margin:0;font-size:14px;color:${BRAND.textSecondary};">Hi ${escapeHtml(customerName)}, ${config.message}</p>
  </div>

  <!-- Order Reference -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};border-radius:6px;padding:12px 16px;margin-bottom:16px;">
    <tr>
      <td style="font-size:13px;color:${BRAND.textSecondary};">Order #<strong style="color:${BRAND.accent};">${order.id}</strong></td>
      <td style="font-size:13px;color:${BRAND.textSecondary};text-align:right;">Total: <strong style="color:${BRAND.textPrimary};">${formatCurrency(order.total)}</strong></td>
    </tr>
  </table>

  <!-- Progress -->
  ${newStatus !== 'cancelled' ? progressHtml : ''}

  ${order.estimated_ready && newStatus !== 'delivered' && newStatus !== 'cancelled' ? `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
    <tr><td style="padding:12px;background-color:${BRAND.bg};border-radius:6px;text-align:center;border-left:3px solid ${BRAND.accent};">
      <p style="margin:0;font-size:12px;color:${BRAND.textSecondary};">Estimated ${orderType === 'delivery' ? 'delivery' : 'ready'} time</p>
      <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:${BRAND.textPrimary};">${formatTime(order.estimated_ready)}</p>
    </td></tr>
  </table>` : ''}

  ${newStatus === 'delivered' ? `
  <div style="text-align:center;margin-top:16px;">
    <p style="margin:0;font-size:14px;color:${BRAND.textSecondary};">We hope you enjoy your meal! We would love to hear your feedback.</p>
  </div>` : ''}
  `;

  return baseLayout(`Order #${order.id} - ${config.heading}`, content);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { orderConfirmationEmail, orderStatusUpdateEmail };
