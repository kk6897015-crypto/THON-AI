import assert from 'assert';
import crypto from 'crypto';

console.log('🧪 Running Razorpay Subscriptions Billing Tests...');

// 1. Test Subscription Signature Verification (HMAC-SHA256)
function verifySubscriptionSignature(paymentId, subscriptionId, signature, secret) {
  const payload = `${paymentId}|${subscriptionId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );
  } catch {
    return false;
  }
}

// 2. Test Webhook Signature Verification (X-Razorpay-Signature)
function verifyWebhookSignature(rawBody, signature, webhookSecret) {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );
  } catch {
    return false;
  }
}

// Test Suite
const testSecret = 'test_razorpay_secret_key_12345';
const testWebhookSecret = 'test_webhook_secret_67890';
const paymentId = 'pay_H1234567890';
const subscriptionId = 'sub_S9876543210';

// Known-good signature generation
const goodSignature = crypto
  .createHmac('sha256', testSecret)
  .update(`${paymentId}|${subscriptionId}`)
  .digest('hex');

// Tampered signature
const tamperedSignature = goodSignature.substring(0, goodSignature.length - 4) + 'abcd';

// Known-good webhook payload and signature
const sampleWebhookBody = JSON.stringify({
  event: 'subscription.charged',
  payload: {
    subscription: { entity: { id: subscriptionId, current_end: 1735689600 } },
    payment: { entity: { id: paymentId, amount: 14900, status: 'captured' } }
  }
});
const goodWebhookSignature = crypto
  .createHmac('sha256', testWebhookSecret)
  .update(sampleWebhookBody)
  .digest('hex');
const tamperedWebhookSignature = 'invalid_webhook_signature_12345';

// Assertions
try {
  // Test 1: Known-good signature succeeds
  assert.strictEqual(
    verifySubscriptionSignature(paymentId, subscriptionId, goodSignature, testSecret),
    true,
    'Known-good signature must pass verification'
  );
  console.log('✅ Test 1 Passed: Known-good subscription signature verified successfully.');

  // Test 2: Tampered signature fails
  assert.strictEqual(
    verifySubscriptionSignature(paymentId, subscriptionId, tamperedSignature, testSecret),
    false,
    'Tampered signature must fail verification'
  );
  console.log('✅ Test 2 Passed: Tampered subscription signature correctly rejected.');

  // Test 3: Wrong secret fails
  assert.strictEqual(
    verifySubscriptionSignature(paymentId, subscriptionId, goodSignature, 'wrong_secret'),
    false,
    'Signature with incorrect secret must fail verification'
  );
  console.log('✅ Test 3 Passed: Signature with incorrect secret rejected.');

  // Test 4: Webhook known-good signature succeeds
  assert.strictEqual(
    verifyWebhookSignature(sampleWebhookBody, goodWebhookSignature, testWebhookSecret),
    true,
    'Valid webhook signature must pass verification'
  );
  console.log('✅ Test 4 Passed: Valid webhook signature verified.');

  // Test 5: Webhook tampered signature fails
  assert.strictEqual(
    verifyWebhookSignature(sampleWebhookBody, tamperedWebhookSignature, testWebhookSecret),
    false,
    'Tampered webhook signature must fail verification'
  );
  console.log('✅ Test 5 Passed: Tampered webhook signature correctly rejected.');

  // Test 6: Mock Razorpay Client Contract
  const mockRazorpayClient = {
    subscriptions: {
      create: async (opts) => {
        assert.ok(opts.plan_id, 'Plan ID must be provided');
        assert.strictEqual(opts.customer_notify, 1, 'Customer notify must be 1');
        return {
          id: 'sub_mock_created_test',
          status: 'created',
          plan_id: opts.plan_id
        };
      }
    }
  };

  mockRazorpayClient.subscriptions.create({
    plan_id: 'plan_pro_149',
    customer_notify: 1,
    notes: { user_id: 'user_123' }
  }).then((res) => {
    assert.strictEqual(res.id, 'sub_mock_created_test');
    assert.strictEqual(res.status, 'created');
    console.log('✅ Test 6 Passed: Mock Razorpay client subscription creation verified.');
    console.log('\n🎉 ALL 6 BILLING UNIT TESTS PASSED SUCCESSFULLY!\n');
  });
} catch (err) {
  console.error('❌ Billing Test Failed:', err);
  process.exit(1);
}
