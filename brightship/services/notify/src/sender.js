async function sendEmail(notification) {
  console.log('Sending EMAIL notification');
  console.log('Recipient:', notification.recipient);
  console.log('Message:', notification.message);


  // Simulate successful delivery
  return {
    success: true,
    provider: 'mock-email',
  };
}

async function sendSms(notification) {
  console.log('Sending SMS notification');
  console.log('Recipient:', notification.recipient);
  console.log('Message:', notification.message);

  // Simulate successful delivery
  return {
    success: true,
    provider: 'mock-sms',
  };
}

async function sendNotification(notification) {
  if (notification.channel === 'email') {
    return sendEmail(notification);
  }

  if (notification.channel === 'sms') {
    return sendSms(notification);
  }

  throw new Error(
    `Unsupported notification channel: ${notification.channel}`
  );
}

module.exports = {
  sendNotification,
};
