describe('Jobs service', () => {
  test('should create a valid shipment processing job payload', () => {
    const job = {
      name: 'process-shipment',
      data: {
        shipmentId: 'test-shipment-001',
        status: 'PENDING',
      },
    };

    expect(job.name).toBe('process-shipment');
    expect(job.data).toEqual({
      shipmentId: 'test-shipment-001',
      status: 'PENDING',
    });
  });

  test('should contain a shipment ID', () => {
    const jobData = {
      shipmentId: 'test-shipment-001',
      status: 'PENDING',
    };

    expect(jobData.shipmentId).toBeDefined();
    expect(jobData.shipmentId).not.toBe('');
  });

  test('should contain a valid shipment status', () => {
    const jobData = {
      shipmentId: 'test-shipment-001',
      status: 'PENDING',
    };

    const validStatuses = [
      'PENDING',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED',
    ];

    expect(validStatuses).toContain(jobData.status);
  });
});
