// Notification service — structured for easy Twilio/SendGrid integration
const { getDb } = require('../db/init');
const { orderConfirmationEmail, orderStatusUpdateEmail } = require('./emailTemplates');

// Map template keys to status values for email template generation
const emailTemplateMap = {
  order_placed: (order) => orderConfirmationEmail(order),
  order_confirmed: (order) => orderStatusUpdateEmail(order, 'confirmed'),
  order_preparing: (order) => orderStatusUpdateEmail(order, 'preparing'),
  order_ready: (order) => orderStatusUpdateEmail(order, 'ready'),
  order_delivered: (order) => orderStatusUpdateEmail(order, 'delivered'),
};

const providers = {
  sms: {
    // Replace with Twilio: client.messages.create({ to, from, body })
    send(to, body) {
      console.log(`[SMS → ${to}] ${body}`);
      return { success: true, provider: 'console' };
    }
  },
  email: {
    // Replace with SendGrid: sgMail.send({ to, from, subject, html })
    send(to, subject, body, html) {
      console.log(`[EMAIL → ${to}] ${subject}: ${body}`);
      if (html) {
        console.log(`[EMAIL HTML → ${to}] HTML template generated (${html.length} chars)`);
      }
      return { success: true, provider: 'console' };
    }
  },
  push: {
    send(userId, title, body) {
      console.log(`[PUSH → user:${userId}] ${title}: ${body}`);
      return { success: true, provider: 'console' };
    }
  }
};

const templates = {
  order_placed: (order) => ({
    subject: `Order #${order.id} Received!`,
    body: `Your order #${order.id} has been received. ${order.type === 'delivery' ? 'Estimated delivery' : 'Estimated ready'}: ${order.estimated_ready ? new Date(order.estimated_ready).toLocaleTimeString() : 'soon'}`
  }),
  order_confirmed: (order) => ({
    subject: `Order #${order.id} Confirmed`,
    body: `Great news! Your order #${order.id} has been confirmed and will be prepared shortly.`
  }),
  order_preparing: (order) => ({
    subject: `Order #${order.id} Being Prepared`,
    body: `Your order #${order.id} is now being prepared in the kitchen! 👨‍🍳`
  }),
  order_ready: (order) => ({
    subject: `Order #${order.id} Ready!`,
    body: order.type === 'pickup' ? `Your order #${order.id} is ready for collection! 🏪` : `Your order #${order.id} is ready and out for delivery! 🚗`
  }),
  order_delivered: (order) => ({
    subject: `Order #${order.id} Delivered`,
    body: `Your order has been delivered. Enjoy your meal! 🍕 Rate your experience in the app.`
  }),
  loyalty_earned: (points, total) => ({
    subject: `You earned ${points} loyalty points!`,
    body: `You now have ${total} loyalty points. Collect 50 for €5 off!`
  })
};

function notify(userId, orderId, templateKey, data) {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) { return; }

  const tmpl = templates[templateKey];
  if (!tmpl) { return; }
  const { subject, body } = tmpl(data);

  const logNotif = db.prepare('INSERT INTO notifications (user_id, order_id, channel, subject, body, status) VALUES (?,?,?,?,?,?)');

  // SMS
  if (user.notify_sms && user.phone) {
    const result = providers.sms.send(user.phone, body);
    logNotif.run(userId, orderId, 'sms', subject, body, result.success ? 'sent' : 'failed');
  }

  // Email (with HTML template when available)
  if (user.notify_email && user.email) {
    let htmlContent = null;
    if (emailTemplateMap[templateKey]) {
      try {
        htmlContent = emailTemplateMap[templateKey](data);
      } catch (e) {
        console.error(`[EMAIL TEMPLATE ERROR] ${templateKey}:`, e.message);
      }
    }
    const result = providers.email.send(user.email, subject, body, htmlContent);
    logNotif.run(userId, orderId, 'email', subject, body, result.success ? 'sent' : 'failed');
  }

  // Push
  if (user.notify_push) {
    const result = providers.push.send(userId, subject, body);
    logNotif.run(userId, orderId, 'push', subject, body, result.success ? 'sent' : 'failed');
  }

}

module.exports = { notify, providers, templates };
