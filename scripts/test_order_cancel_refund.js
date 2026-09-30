const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5001';

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`🧪 Testing DigiLocal Order Cancellation & Refund APIs`);
  console.log(`📍 Target Base URL: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let passCount = 0;
  let failCount = 0;

  function assert(condition, testName, extraInfo = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${extraInfo}`);
      passCount++;
    } else {
      console.error(`❌ FAIL: ${testName} ${extraInfo}`);
      failCount++;
    }
  }

  try {
    // 1. Create an Online Paid Order
    console.log(`\n--- Test 1: Create Prepaid Online Order & Cancel with Auto Source Refund ---`);
    const prepaidOrderPayload = {
      user_id: 'usr_test_refund_101',
      vendor_id: 14,
      store_name: 'Green Grocers & Dairy',
      customer_name: 'Aditya Sharma',
      phone_number: '9876543219',
      address: 'Tower B - Flat 402, Royal Residency',
      society_name: 'Royal Residency',
      total_amount: 450.00,
      payment_method: 'CASHFREE',
      payment_status: 'PAID',
      status: 'CONFIRMED',
      items: [
        { item_name: 'Farm Fresh Cow Milk 1L', quantity: 2, price: 65.00 },
        { item_name: 'Organic Brown Bread', quantity: 2, price: 50.00 },
        { item_name: 'Pure Desi Ghee 500g', quantity: 1, price: 220.00 }
      ]
    };

    const createRes1 = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prepaidOrderPayload)
    });
    const createData1 = await createRes1.json();
    const order1Id = createData1.order?.order_id || createData1.order_id || createData1.id || 'ORD_TEST_101';
    console.log(`Created Online Paid Order: ${order1Id}`);

    // Now Cancel the order
    const cancelRes1 = await fetch(`${BASE_URL}/api/orders/${order1Id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Changed delivery time preference' })
    });
    const cancelData1 = await cancelRes1.json();
    console.log('Cancel Response:', JSON.stringify(cancelData1, null, 2));

    assert(cancelRes1.ok && cancelData1.success === true, '1.1 Cancellation response is successful');
    assert(cancelData1.status === 'CANCELLED', '1.2 Order status transitioned to CANCELLED');
    assert(cancelData1.payment_status === 'REFUNDED', '1.3 Payment status updated to REFUNDED');
    assert(cancelData1.is_online_paid === true, '1.4 Identified as online paid order');
    assert(cancelData1.refund && cancelData1.refund.refund_initiated === true, '1.5 Cashfree source refund initiated');
    assert(Number(cancelData1.refund.refund_amount) === 450.00, '1.6 Refund amount matches total amount (₹450.00)');
    assert(cancelData1.refund.refund_id && cancelData1.refund.refund_id.startsWith('REF_'), '1.7 Unique refund_id generated');

    // 2. Double Cancel Guard: Try cancelling the already cancelled order
    console.log(`\n--- Test 2: Double Cancel Guard (Cannot cancel already cancelled order) ---`);
    const doubleCancelRes = await fetch(`${BASE_URL}/api/orders/${order1Id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Trying to cancel again' })
    });
    const doubleCancelData = await doubleCancelRes.json();
    console.log('Double Cancel Response:', doubleCancelRes.status, doubleCancelData);

    assert(doubleCancelRes.status === 400, '2.1 Returns 400 Bad Request on duplicate cancellation');
    assert(doubleCancelData.success === false, '2.2 Success is false');
    assert(doubleCancelData.error && doubleCancelData.error.includes('already cancelled'), '2.3 Error explains order is already cancelled');

    // 3. Delivered Order Guard: Create a DELIVERED order and try to cancel
    console.log(`\n--- Test 3: Delivered Order Guard (Cannot cancel delivered order) ---`);
    const deliveredOrderPayload = {
      user_id: 'usr_test_refund_102',
      vendor_id: 14,
      store_name: 'Green Grocers',
      customer_name: 'Pooja Verma',
      phone_number: '9876543218',
      total_amount: 150.00,
      payment_method: 'UPI',
      payment_status: 'PAID',
      status: 'DELIVERED',
      items: [{ item_name: 'Snacks', quantity: 1, price: 150.00 }]
    };

    const createRes2 = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deliveredOrderPayload)
    });
    const createData2 = await createRes2.json();
    const order2Id = createData2.order?.order_id || createData2.order_id || createData2.id || 'ORD_TEST_102';

    const cancelDeliveredRes = await fetch(`${BASE_URL}/api/orders/${order2Id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Dispute after delivery' })
    });
    const cancelDeliveredData = await cancelDeliveredRes.json();
    console.log('Cancel Delivered Response:', cancelDeliveredRes.status, cancelDeliveredData);

    assert(cancelDeliveredRes.status === 400, '3.1 Returns 400 Bad Request on delivered order cancellation');
    assert(cancelDeliveredData.success === false, '3.2 Success is false');
    assert(cancelDeliveredData.error && cancelDeliveredData.error.includes('delivered or completed'), '3.3 Error explains order is delivered');

    // 4. Cash on Delivery (COD) Order Cancel: No refund should be triggered
    console.log(`\n--- Test 4: COD Order Cancel (Transitions to CANCELLED without gateway refund) ---`);
    const codOrderPayload = {
      user_id: 'usr_test_refund_103',
      vendor_id: 14,
      store_name: 'Green Grocers',
      customer_name: 'Vikram Singh',
      phone_number: '9876543217',
      total_amount: 280.00,
      payment_method: 'COD',
      payment_status: 'PENDING',
      status: 'PLACED',
      items: [{ item_name: 'Fresh Vegetables Basket', quantity: 1, price: 280.00 }]
    };

    const createRes3 = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(codOrderPayload)
    });
    const createData3 = await createRes3.json();
    const order3Id = createData3.order?.order_id || createData3.order_id || createData3.id || 'ORD_TEST_103';

    const cancelCodRes = await fetch(`${BASE_URL}/api/orders/${order3Id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'No longer needed' })
    });
    const cancelCodData = await cancelCodRes.json();
    console.log('Cancel COD Response:', cancelCodRes.status, cancelCodData);

    assert(cancelCodRes.ok && cancelCodData.success === true, '4.1 COD cancellation succeeds');
    assert(cancelCodData.status === 'CANCELLED', '4.2 Status transitioned to CANCELLED');
    assert(cancelCodData.is_online_paid === false, '4.3 Correctly tagged as not online paid');
    assert(cancelCodData.refund === null, '4.4 Refund is null (no gateway refund called)');

    // 5. Programmatic Manual Refund via POST /api/payments/cashfree/refund
    console.log(`\n--- Test 5: Programmatic Manual Refund Endpoint (/api/payments/cashfree/refund) ---`);
    const manualRefundRes = await fetch(`${BASE_URL}/api/payments/cashfree/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: order1Id,
        amount: 450.00,
        reason: 'Customer support dispute resolution'
      })
    });
    const manualRefundData = await manualRefundRes.json();
    console.log('Manual Refund Response:', manualRefundData);

    assert(manualRefundRes.ok && manualRefundData.success === true, '5.1 Manual refund endpoint succeeds');
    assert(manualRefundData.refund && manualRefundData.refund.refund_status === 'SUCCESS', '5.2 Refund status is SUCCESS');
    assert(manualRefundData.refund.destination === 'ORIGINAL_PAYMENT_SOURCE', '5.3 Refund destination is ORIGINAL_PAYMENT_SOURCE');

    // 6. Inspect Order Detail via GET /api/orders/:orderId
    console.log(`\n--- Test 6: Verify Single Order Detail Includes Refund Data ---`);
    const getOrderRes = await fetch(`${BASE_URL}/api/orders/${order1Id}`);
    const getOrderData = await getOrderRes.json();
    console.log('Get Order Detail:', JSON.stringify(getOrderData.order, null, 2));

    assert(getOrderRes.ok, '6.1 GET /api/orders/:id succeeds');
    assert(getOrderData.order.status === 'CANCELLED', '6.2 Order status is CANCELLED');
    assert(getOrderData.order.payment_status === 'REFUNDED', '6.3 Order payment_status is REFUNDED');
    assert(getOrderData.order.refund_id !== undefined, '6.4 Order detail includes refund_id');
    assert(Number(getOrderData.order.refund_amount) === 450.00, '6.5 Order detail includes refund_amount');

  } catch (err) {
    console.error('Test execution exception:', err);
    failCount++;
  }

  console.log(`\n======================================================`);
  console.log(`🏁 Test Summary: ${passCount} PASSED, ${failCount} FAILED`);
  console.log(`======================================================\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
