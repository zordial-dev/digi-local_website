const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5001';

async function runTests() {
  console.log(`\n========================================================================`);
  console.log(`🧪 Testing DigiLocal Order Refund Lifecycle & Webhook APIs`);
  console.log(`📍 Target Base URL: ${BASE_URL}`);
  console.log(`========================================================================\n`);

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
    // ------------------------------------------------------------------------
    // TEST 1: Customer Cancels Prepaid Order -> Stage 1: REFUND_IN_PROGRESS
    // ------------------------------------------------------------------------
    console.log(`\n--- Test 1: Customer Cancels Prepaid Order (Stage 1: REFUND_IN_PROGRESS) ---`);
    const order1Payload = {
      user_id: 'usr_refund_flow_101',
      vendor_id: 14,
      store_name: 'Green Grocers & Dairy',
      customer_name: 'Aarushi Verma',
      phone_number: '9876543210',
      address: 'Tower A-402, Greenwood Residency',
      society_name: 'Greenwood Residency',
      total_amount: 350.00,
      payment_method: 'CASHFREE',
      payment_status: 'PAID',
      status: 'CONFIRMED',
      items: [
        { item_name: 'Cold Coffee Large', quantity: 2, price: 175.00 }
      ]
    };

    const createRes1 = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order1Payload)
    });
    const createData1 = await createRes1.json();
    const order1Id = createData1.order?.order_id || createData1.order_id || createData1.id;
    console.log(`Created Order: ${order1Id}`);

    const cancelRes1 = await fetch(`${BASE_URL}/api/orders/${order1Id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Changed my mind' })
    });
    const cancelData1 = await cancelRes1.json();

    assert(cancelRes1.status === 200, 'POST /api/orders/:id/cancel returns 200 OK');
    assert(cancelData1.success === true, 'Response has success: true');
    assert(cancelData1.status === 'CANCELLED', 'Order status is CANCELLED');
    assert(cancelData1.payment_status === 'REFUND_IN_PROGRESS', 'payment_status is REFUND_IN_PROGRESS');
    assert(cancelData1.refund_status === 'IN_PROGRESS', 'refund_status is IN_PROGRESS');
    assert(cancelData1.is_refund_in_progress === true, 'is_refund_in_progress is true');
    assert(cancelData1.is_online_paid === true, 'is_online_paid is true');
    assert(Boolean(cancelData1.refund?.refund_id), 'refund.refund_id generated', `(${cancelData1.refund?.refund_id})`);
    assert(cancelData1.refund?.refund_amount === 350.00, 'refund.refund_amount is 350.00');
    assert(cancelData1.refund?.destination.includes('Original Payment Source'), 'refund destination mentions Original Payment Source');

    // ------------------------------------------------------------------------
    // TEST 2: Lookup Single Order Details in Stage 1
    // ------------------------------------------------------------------------
    console.log(`\n--- Test 2: Fetch Single Order Details in Stage 1 ---`);
    const getRes1 = await fetch(`${BASE_URL}/api/orders/${order1Id}`);
    const getData1 = await getRes1.json();
    const orderDetails1 = getData1.order;

    assert(getRes1.status === 200, 'GET /api/orders/:orderId returns 200 OK');
    assert(orderDetails1.status === 'CANCELLED', 'order.status is CANCELLED');
    assert(orderDetails1.payment_status === 'REFUND_IN_PROGRESS', 'order.payment_status is REFUND_IN_PROGRESS');
    assert(orderDetails1.refund_status === 'IN_PROGRESS', 'order.refund_status is IN_PROGRESS');
    assert(orderDetails1.is_refund_in_progress === true, 'order.is_refund_in_progress is true');
    assert(Boolean(orderDetails1.refund_id), 'order.refund_id is populated');
    assert(Number(orderDetails1.refund_amount) === 350.00, 'order.refund_amount matches');

    // ------------------------------------------------------------------------
    // TEST 3: Cashfree Webhook Callback -> Stage 2: REFUND_COMPLETED
    // ------------------------------------------------------------------------
    console.log(`\n--- Test 3: Cashfree Webhook Callback (Transition to REFUND_COMPLETED) ---`);
    const webhookPayload = {
      event: 'REFUND_COMPLETED',
      order_id: order1Id,
      refund_id: cancelData1.refund?.refund_id,
      cf_refund_id: cancelData1.refund?.cf_refund_id,
      status: 'SUCCESS'
    };

    const webhookRes = await fetch(`${BASE_URL}/api/payments/cashfree/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });
    const webhookData = await webhookRes.json();

    assert(webhookRes.status === 200, 'POST /api/payments/cashfree/webhook returns 200 OK');
    assert(webhookData.payment_status === 'REFUND_COMPLETED', 'Webhook sets payment_status to REFUND_COMPLETED');
    assert(webhookData.refund_status === 'COMPLETED', 'Webhook sets refund_status to COMPLETED');
    assert(webhookData.is_refund_in_progress === false, 'Webhook sets is_refund_in_progress to false');

    // Verify GET /api/orders/:orderId in Stage 2
    const getRes2 = await fetch(`${BASE_URL}/api/orders/${order1Id}`);
    const getData2 = await getRes2.json();
    const orderDetails2 = getData2.order;

    assert(orderDetails2.payment_status === 'REFUND_COMPLETED', 'order.payment_status is now REFUND_COMPLETED');
    assert(orderDetails2.refund_status === 'COMPLETED', 'order.refund_status is now COMPLETED');
    assert(orderDetails2.is_refund_in_progress === false, 'order.is_refund_in_progress is false');
    assert(orderDetails2.refund_status_label === 'Refund Completed', 'order.refund_status_label is Refund Completed');

    // ------------------------------------------------------------------------
    // TEST 4: Resident User Order History (GET /api/orders/user/:userId)
    // ------------------------------------------------------------------------
    console.log(`\n--- Test 4: Resident User Order History View ---`);
    const userOrdersRes = await fetch(`${BASE_URL}/api/orders/user/usr_refund_flow_101`);
    const userOrdersData = await userOrdersRes.json();
    const foundUserOrder = userOrdersData.orders?.find(o => o.order_id === order1Id || o.id === order1Id);

    assert(userOrdersRes.status === 200, 'GET /api/orders/user/:userId returns 200 OK');
    assert(Boolean(foundUserOrder), 'Order found in user order list');
    assert(foundUserOrder.status === 'CANCELLED', 'user order status is CANCELLED');
    assert(foundUserOrder.status_label.includes('Refund Completed'), 'user order status_label is Order Cancelled (Refund Completed)', `(${foundUserOrder.status_label})`);
    assert(foundUserOrder.payment_status === 'REFUND_COMPLETED', 'user order payment_status is REFUND_COMPLETED');
    assert(foundUserOrder.refund_status === 'COMPLETED', 'user order refund_status is COMPLETED');
    assert(foundUserOrder.is_refund_in_progress === false, 'user order is_refund_in_progress is false');
    assert(Number(foundUserOrder.refund_amount) === 350.00, 'user order refund_amount is 350.00');

    // ------------------------------------------------------------------------
    // TEST 5: Vendor Rejects / Cancels Prepaid Order
    // ------------------------------------------------------------------------
    console.log(`\n--- Test 5: Vendor Rejects Prepaid Order via PUT /api/orders/:id/status ---`);
    const order2Payload = {
      user_id: 'usr_refund_flow_102',
      vendor_id: 14,
      store_name: 'Green Grocers & Dairy',
      customer_name: 'Rahul Khanna',
      phone_number: '9876543211',
      address: 'Tower C-101, Greenwood Residency',
      total_amount: 520.00,
      payment_method: 'CASHFREE',
      payment_status: 'PAID',
      status: 'ACCEPTED',
      items: [
        { item_name: 'Organic Honey 500g', quantity: 1, price: 520.00 }
      ]
    };

    const createRes2 = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order2Payload)
    });
    const createData2 = await createRes2.json();
    const order2Id = createData2.order?.order_id || createData2.order_id || createData2.id;

    const vendorCancelRes = await fetch(`${BASE_URL}/api/orders/${order2Id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED', reason: 'Item out of stock' })
    });
    const vendorCancelData = await vendorCancelRes.json();

    assert(vendorCancelRes.status === 200, 'PUT /api/orders/:id/status returns 200 OK');
    assert(vendorCancelData.status === 'CANCELLED', 'Vendor cancel sets status to CANCELLED');
    assert(vendorCancelData.payment_status === 'REFUND_IN_PROGRESS', 'Vendor cancel sets payment_status to REFUND_IN_PROGRESS');
    assert(vendorCancelData.refund_status === 'IN_PROGRESS', 'Vendor cancel sets refund_status to IN_PROGRESS');
    assert(vendorCancelData.is_refund_in_progress === true, 'Vendor cancel sets is_refund_in_progress to true');
    assert(vendorCancelData.refund?.refund_amount === 520.00, 'Vendor cancel refund.refund_amount is 520.00');

    // ------------------------------------------------------------------------
    // TEST 6: Cash on Delivery / Unpaid Order Cancellation
    // ------------------------------------------------------------------------
    console.log(`\n--- Test 6: COD / Unpaid Order Cancellation ---`);
    const codOrderPayload = {
      user_id: 'usr_refund_flow_103',
      vendor_id: 14,
      customer_name: 'Pooja Hegde',
      phone_number: '9876543212',
      address: 'Tower D-204',
      total_amount: 150.00,
      payment_method: 'COD',
      payment_status: 'PENDING',
      status: 'PLACED',
      items: [{ item_name: 'Milk 1L', quantity: 3, price: 50.00 }]
    };

    const createCodRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(codOrderPayload)
    });
    const createCodData = await createCodRes.json();
    const codOrderId = createCodData.order?.order_id || createCodData.order_id || createCodData.id;

    const codCancelRes = await fetch(`${BASE_URL}/api/orders/${codOrderId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Found cheaper elsewhere' })
    });
    const codCancelData = await codCancelRes.json();

    assert(codCancelRes.status === 200, 'COD cancel returns 200 OK');
    assert(codCancelData.status === 'CANCELLED', 'COD status is CANCELLED');
    assert(codCancelData.payment_status === 'CANCELLED', 'COD payment_status is CANCELLED');
    assert(codCancelData.is_online_paid === false, 'COD is_online_paid is false');
    assert(codCancelData.refund === null, 'COD refund is null');

  } catch (err) {
    console.error('💥 Test Execution Error:', err);
    failCount++;
  }

  console.log(`\n========================================================================`);
  console.log(`📊 Test Summary: Total: ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);
  console.log(`========================================================================\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
