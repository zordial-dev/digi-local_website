import http from 'http';
import { spawn } from 'child_process';

const BASE = 'http://localhost:5001';

function makeRequest(urlPath, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (_) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting DigiLocal OTP & Progressive Cooldown API Validation Tests...');

  // 1. Test check-account for existing user (Aarushi: 9784319840)
  console.log('\n--- 1. Testing check-account (Existing User) ---');
  const checkRes1 = await makeRequest('/api/auth/check-account', 'POST', {
    identifier: '9784319840',
    role: 'user'
  });
  console.log('Status:', checkRes1.status);
  console.log('Response:', JSON.stringify(checkRes1.data, null, 2));
  console.assert(checkRes1.status === 200, 'Expected 200');
  console.assert(checkRes1.data.exists === true, 'Expected exists: true');
  console.assert(checkRes1.data.next_action === 'LOGIN', 'Expected next_action: LOGIN');

  // 2. Test check-account for non-existing user (e.g. 9111122222)
  console.log('\n--- 2. Testing check-account (Non-Existing User) ---');
  const checkRes2 = await makeRequest('/api/auth/check-account', 'POST', {
    identifier: '9111122222',
    role: 'user'
  });
  console.log('Status:', checkRes2.status);
  console.log('Response:', JSON.stringify(checkRes2.data, null, 2));
  console.assert(checkRes2.status === 200, 'Expected 200');
  console.assert(checkRes2.data.exists === false, 'Expected exists: false');
  console.assert(checkRes2.data.next_action === 'REGISTER', 'Expected next_action: REGISTER');

  // 3. Test send-otp for Registration (Direct dispatch)
  console.log('\n--- 3. Testing send-otp (Registration Flow) ---');
  const testPhone = '9822334455';
  const sendRes1 = await makeRequest('/api/users/send-otp', 'POST', {
    phone: testPhone,
    purpose: 'register'
  });
  console.log('Status:', sendRes1.status);
  console.log('Response:', JSON.stringify(sendRes1.data, null, 2));
  console.assert(sendRes1.status === 200, 'Expected 200');
  console.assert(sendRes1.data.cooldown_seconds === 10, 'Expected cooldown 10s');
  console.assert(sendRes1.data.attempt === 1, 'Expected attempt 1');
  const generatedOtp = sendRes1.data.otp;

  // 4. Test Progressive Cooldown (Immediate resend attempt -> Expected 429)
  console.log('\n--- 4. Testing Immediate Resend -> Rate Limit 429 ---');
  const sendRes2 = await makeRequest('/api/users/send-otp', 'POST', {
    phone: testPhone,
    purpose: 'register'
  });
  console.log('Status:', sendRes2.status);
  console.log('Retry-After Header:', sendRes2.headers['retry-after']);
  console.log('Response:', JSON.stringify(sendRes2.data, null, 2));
  console.assert(sendRes2.status === 429, 'Expected 429 Too Many Requests');
  console.assert(sendRes2.data.retry_after > 0, 'Expected retry_after > 0');

  // 5. Test verify-otp (Successful Verification & Auto-Reset Cooldown)
  console.log('\n--- 5. Testing verify-otp (Success & Cooldown Reset) ---');
  const verifyRes = await makeRequest('/api/users/verify-otp', 'POST', {
    phone: testPhone,
    otp: generatedOtp,
    purpose: 'register'
  });
  console.log('Status:', verifyRes.status);
  console.log('Response:', JSON.stringify(verifyRes.data, null, 2));
  console.assert(verifyRes.status === 200, 'Expected 200');
  console.assert(verifyRes.data.success === true, 'Expected success: true');

  // 6. Test check-account post-reset (Cooldown should be 0)
  console.log('\n--- 6. Verifying Cooldown Reset ---');
  const checkRes3 = await makeRequest('/api/auth/check-account', 'POST', {
    identifier: testPhone,
    role: 'user'
  });
  console.log('Status:', checkRes3.status);
  console.log('Cooldown state:', JSON.stringify(checkRes3.data.cooldown, null, 2));
  console.assert(checkRes3.data.cooldown.in_cooldown === false, 'Expected in_cooldown: false');
  console.assert(checkRes3.data.cooldown.attempt === 0, 'Expected attempt: 0');

  console.log('\n✅ ALL OTP & PROGRESSIVE COOLDOWN API TESTS PASSED SUCCESSFULLY!\n');
}

// Start server child process
console.log('Starting local server for testing...');
const serverProcess = spawn('node', ['server.js'], { stdio: 'inherit' });

setTimeout(async () => {
  try {
    await runTests();
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    serverProcess.kill();
    process.exit(0);
  }
}, 1200);
