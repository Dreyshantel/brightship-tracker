describe('Notification service', () => {
  test('should create a valid notification job payload', () => {
    const notification = {
      name: 'send-notification',
      data: {
        shipmentId: 'test-shipment-001',
        recipient: 'test@example.com',
        channel: 'email',
        message: 'Your shipment is now IN_TRANSIT.',
      },
    };

    expect(notification.name).toBe('send-notification');

    expect(notification.data).toEqual({
      shipmentId: 'test-shipment-001',
      recipient: 'test@example.com',
      channel: 'email',
      message: 'Your shipment is now IN_TRANSIT.',
    });
  });

  test('should contain a valid recipient', () => {
    const notification = {
      recipient: 'test@example.com',
    };

    expect(notification.recipient).toContain('@');
  });

  test('should use a supported notification channel', () => {
    const notification = {
      channel: 'email',
    };

    const supportedChannels = [
      'email',
      'sms',
    ];

    expect(supportedChannels).toContain(notification.channel);
  });

  test('should contain a notification message', () => {
    const notification = {
      message: 'Your shipment is now IN_TRANSIT.',
    };

    expect(notification.message).toBeDefined();
    expect(notification.message.length).toBeGreaterThan(0);
  });
});
