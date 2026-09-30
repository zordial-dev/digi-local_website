const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5001';

async function runLifecycleTests() {
  console.log(`\n======================================================`);
  console.log(`🧪 Testing DigiLocal Order Status & Lifecycle State Machine`);
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
    // 1. Create a Test COD Order
    console.log(`\n--- Test 1: Create Initial COD Order (Status: PLACED) ---`);
    const createRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'usr_lifecycle_101',
        vendor_id: 1296,
        store_name: 'FreshMart Grocery & Organic',
        society_name: 'Greenwood Residency',
        customer_name: 'Aarushi Verma',
        phone_number: '9876543210',
        address: 'Tower A-402, Greenwood Residency',
        total_amount: 250.00,
        payment_method: 'COD',
        payment_status: 'PENDING',
        status: 'PLACED',
        items: [
          { item_id: 101, item_name: 'Whole Wheat Brown Bread', quantity: 2, price: 50.00 },
          { item_id: 102, item_name: 'Fresh Cow Milk 1L', quantity: 3, price: 50.00 }
        ]
      })
    });
    const createData = await createRes.json();
    const orderId = createData.order?.order_id || createData.order_id || 'ORD-5481';
    console.log(`Created Order ID: ${orderId}`);

    assert(createRes.ok, '1.1 Order created successfully');
    assert(createData.order?.status === 'PLACED', '1.2 Initial status is PLACED');

    // 2. Transition 1: Vendor Accepts Order ("ACCEPTED")
    console.log(`\n--- Test 2: Vendor Accepts Order (PUT /api/orders/:id/status with "ACCEPTED") ---`);
    const acceptRes = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACCEPTED' })
    });
    const acceptData = await acceptRes.json();
    console.log('Accept Response:', acceptData);

    assert(acceptRes.ok, '2.1 Accept status call succeeds');
    assert(acceptData.status === 'ACCEPTED', '2.2 Status normalized to ACCEPTED');
    assert(acceptData.raw_status === 'ACCEPTED', '2.3 Echoes back raw_status');

    // 3. Transition 2: Vendor Dispatches ("OUT_FOR_DELIVERY" -> "IN_PROGRESS")
    console.log(`\n--- Test 3: Normalization ("OUT_FOR_DELIVERY" -> "IN_PROGRESS") ---`);
    const dispatchRes = await fetch(`${BASE_URL}/api/vendors/1296/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' })
    });
    const dispatchData = await dispatchRes.json();
    console.log('Dispatch Response:', dispatchData);

    assert(dispatchRes.ok, '3.1 Vendor subroute PUT succeeds');
    assert(dispatchData.status === 'IN_PROGRESS', '3.2 OUT_FOR_DELIVERY normalized to IN_PROGRESS');
    assert(dispatchData.raw_status === 'OUT_FOR_DELIVERY', '3.3 raw_status returned as OUT_FOR_DELIVERY');

    // 4. Transition 3: Mark Delivered ("DELIVERED" -> "COMPLETED")
    console.log(`\n--- Test 4: Normalization ("DELIVERED" -> "COMPLETED") ---`);
    const deliverRes = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DELIVERED' })
    });
    const deliverData = await deliverRes.json();
    console.log('Deliver Response:', deliverData);

    assert(deliverRes.ok, '4.1 Deliver status update succeeds');
    assert(deliverData.status === 'COMPLETED', '4.2 DELIVERED normalized to COMPLETED');
    assert(deliverData.raw_status === 'DELIVERED', '4.3 raw_status returned as DELIVERED');

    // 5. Test Invalid Status Validation (400 Bad Request)
    console.log(`\n--- Test 5: Invalid Status Validation ("SHIPPED" -> 400 Bad Request) ---`);
    const invalidRes = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SHIPPED' })
    });
    const invalidData = await invalidRes.json();
    console.log('Invalid Status Response:', invalidRes.status, invalidData);

    assert(invalidRes.status === 400, '5.1 Returns 400 Bad Request on invalid status');
    assert(invalidData.allowedStatuses && invalidData.allowedStatuses.includes('ACCEPTED'), '5.2 Returns list of allowedStatuses');

    // 6. Test Non-Existent Order (404 Not Found)
    console.log(`\n--- Test 6: Non-Existent Order ID (404 Not Found) ---`);
    const notFoundRes = await fetch(`${BASE_URL}/api/orders/ORD-NONEXISTENT-9999/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACCEPTED' })
    });
    const notFoundData = await notFoundRes.json();
    console.log('Not Found Response:', notFoundRes.status, notFoundData);

    assert(notFoundRes.status === 404, '6.1 Returns 404 Not Found for non-existent order');
    assert(notFoundData.error && notFoundData.error.includes('not found'), '6.2 Error mentions order not found');

    // 7. Fetch Single Order Details (GET /api/orders/:orderId)
    console.log(`\n--- Test 7: Fetch Single Order Details (GET /api/orders/:orderId) ---`);
    const singleOrderRes = await fetch(`${BASE_URL}/api/orders/${orderId}`);
    const singleOrderData = await singleOrderRes.json();
    console.log('Single Order:', JSON.stringify(singleOrderData, null, 2));

    assert(singleOrderRes.ok, '7.1 Single order GET succeeds');
    assert(singleOrderData.order && singleOrderData.order.order_id === orderId, '7.2 Order ID matches');
    assert(Array.isArray(singleOrderData.items) && singleOrderData.items.length === 2, '7.3 Itemized items array returned');
    assert(singleOrderData.order.customer_name === 'Aarushi Verma', '7.4 Customer name populated');

    // 8. Fetch Resident User Orders (GET /api/orders/user/:userId - Uppercase Status)
    console.log(`\n--- Test 8: Fetch Resident User Orders (GET /api/orders/user/:userId) ---`);
    const userOrdersRes = await fetch(`${BASE_URL}/api/orders/user/usr_lifecycle_101`);
    const userOrdersData = await userOrdersRes.json();
    console.log('User Orders Count:', userOrdersData.count);

    assert(userOrdersRes.ok, '8.1 User orders GET succeeds');
    assert(Array.isArray(userOrdersData.orders) && userOrdersData.orders.length > 0, '8.2 Orders list returned');
    const userOrder = userOrdersData.orders.find(o => o.order_id === orderId);
    assert(userOrder && userOrder.status === 'COMPLETED', '8.3 User order status formatted in UPPERCASE');

    // 9. Fetch Vendor Orders (GET /api/orders/vendor/:vendorId - Lowercase Status)
    console.log(`\n--- Test 9: Fetch Vendor Orders (GET /api/orders/vendor/:vendorId) ---`);
    const vendorOrdersRes = await fetch(`${BASE_URL}/api/orders/vendor/1296`);
    const vendorOrdersData = await vendorOrdersRes.json();
    console.log('Vendor Orders Count:', Array.isArray(vendorOrdersData) ? vendorOrdersData.length : 0);

    assert(vendorOrdersRes.ok, '9.1 Vendor orders GET succeeds');
    assert(Array.isArray(vendorOrdersData), '9.2 Vendor orders returned as array');
    const vendorOrder = vendorOrdersData.find(o => o.order_id === orderId);
    assert(vendorOrder && vendorOrder.status === 'completed', '9.3 Vendor order status formatted in lowercase');

    // 10. Filter Orders by Query Parameters (GET /api/orders?phone=9876543210)
    console.log(`\n--- Test 10: Generic Query Filtering (GET /api/orders?phone=9876543210) ---`);
    const filterRes = await fetch(`${BASE_URL}/api/orders?phone=9876543210`);
    const filterData = await filterRes.json();
    const filterList = Array.isArray(filterData) ? filterData : (filterData.orders || []);
    console.log('Filtered Orders Count:', filterList.length);

    assert(filterRes.ok, '10.1 Query filter GET succeeds');
    assert(filterList.some(o => o.order_id === orderId), '10.2 Filter matches order by phone number');

    // 11. Trigger Vendor Notification Alert (POST /api/orders/:id/notify)
    console.log(`\n--- Test 11: Trigger Vendor Push Notification (POST /api/orders/:id/notify) ---`);
    const notifyRes = await fetch(`${BASE_URL}/api/orders/${orderId}/notify`, {
      method: 'POST'
    });
    const notifyData = await notifyRes.json();
    console.log('Notify Response:', notifyData);

    assert(notifyRes.ok && notifyData.success === true, '11.1 Vendor notification trigger succeeds');
    assert(notifyData.order_id === orderId, '11.2 Notified with correct order_id');

  } catch (err) {
    console.error('Lifecycle Test Exception:', err);
    failCount++;
  }

  console.log(`\n======================================================`);
  console.log(`🏁 Lifecycle Test Summary: ${passCount} PASSED, ${failCount} FAILED`);
  console.log(`======================================================\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runLifecycleTests();
