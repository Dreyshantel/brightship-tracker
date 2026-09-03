function createNotification({
  shipmentId,
  recipient,
  channel,
  message,
}) {
  return {
    shipmentId,
    recipient,
    channel,
    message,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  createNotification,
};
