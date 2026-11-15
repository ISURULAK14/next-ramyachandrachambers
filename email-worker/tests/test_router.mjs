import assert from 'node:assert';
import { webcrypto } from 'node:crypto';

// Polyfill crypto if needed
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

// Import or recreate pure functions for testing
function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(b64url) {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function signHmac(secret, data) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyHmac(secret, data, hexSignature) {
  if (hexSignature.length !== 64) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const sigBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    const byte = parseInt(hexSignature.slice(i * 2, i * 2 + 2), 16);
    if (isNaN(byte)) return false;
    sigBytes[i] = byte;
  }
  return await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data));
}

function isAllowedSender(senderEmail, allowedListStr) {
  const allowed = allowedListStr
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(senderEmail.toLowerCase().trim());
}

function verifyAuthenticationResults(headers, allowedSenders, requireAuth) {
  if (!requireAuth) return true;

  const authHeader = (
    headers.get('Authentication-Results') ||
    headers.get('authentication-results') ||
    ''
  ).toLowerCase();

  if (!authHeader) {
    return false;
  }

  const hasSpfPass = /\bspf=pass\b/.test(authHeader);
  const hasDkimPass = /\bdkim=pass\b/.test(authHeader);
  const hasArcPass = /\barc=pass\b/.test(authHeader);

  if (!hasSpfPass && !hasDkimPass && !hasArcPass) {
    return false;
  }

  const allowedDomains = allowedSenders
    .map(s => s.split('@')[1]?.trim().toLowerCase())
    .filter(Boolean);

  return allowedDomains.some(dom => authHeader.includes(dom));
}

async function runTests() {
  console.log('--- TEST 1: Base64Url encode/decode ---');
  const testEmails = [
    'client@example.com',
    'john.doe+test@sub.domain.co.uk',
    'ramyachndra@sltnet.lk',
    'complex-name_123@googlemail.com'
  ];
  for (const email of testEmails) {
    const encoded = toBase64Url(email);
    assert(!encoded.includes('+') && !encoded.includes('/') && !encoded.includes('='), `Has special chars: ${encoded}`);
    const decoded = fromBase64Url(encoded);
    assert.strictEqual(decoded, email, `Decoded mismatch: ${decoded} !== ${email}`);
  }
  console.log('✓ Base64Url encoding/decoding passed');

  console.log('--- TEST 2: HMAC-SHA256 Signing & Constant-Time Verification ---');
  const secret = 'super-secret-random-hex-string-for-antigravity-testing-1234567890';
  const data = `${toBase64Url('client@example.com')}.${toBase64Url('host@ramyachandrachambers.com')}`;
  const sig = await signHmac(secret, data);
  assert.strictEqual(sig.length, 64, `Signature length should be 64 hex characters, got ${sig.length}`);

  const valid = await verifyHmac(secret, data, sig);
  assert.strictEqual(valid, true, 'Valid signature should verify');

  const tamperedData = await verifyHmac(secret, `${data}tampered`, sig);
  assert.strictEqual(tamperedData, false, 'Tampered data must fail');

  const tamperedSig = await verifyHmac(secret, data, sig.substring(0, 63) + (sig[63] === '0' ? '1' : '0'));
  assert.strictEqual(tamperedSig, false, 'Tampered signature must fail');

  const invalidLength = await verifyHmac(secret, data, sig.substring(0, 60));
  assert.strictEqual(invalidLength, false, 'Invalid length signature must fail');
  console.log('✓ HMAC-SHA256 signing and constant-time verification passed');

  console.log('--- TEST 3: Sender Whitelist Verification ---');
  const allowed = 'ramyachndra@sltnet.lk, backup@gmail.com';
  assert.strictEqual(isAllowedSender('ramyachndra@sltnet.lk', allowed), true);
  assert.strictEqual(isAllowedSender('RAMYACHNDRA@SLTNET.LK', allowed), true);
  assert.strictEqual(isAllowedSender('backup@gmail.com', allowed), true);
  assert.strictEqual(isAllowedSender('hacker@evil.com', allowed), false);
  assert.strictEqual(isAllowedSender('spoofed@sltnet.lk', allowed), false);
  console.log('✓ Sender whitelist passed');

  console.log('--- TEST 4: Authentication-Results Verification ---');
  const allowedList = ['ramyachndra@sltnet.lk', 'backup@gmail.com'];
  
  const headersValidSpf = new Headers({
    'Authentication-Results': 'mx.cloudflare.net; spf=pass (domain of sltnet.lk designates 192.0.2.1 as permitted sender)'
  });
  assert.strictEqual(verifyAuthenticationResults(headersValidSpf, allowedList, true), true);

  const headersValidDkim = new Headers({
    'Authentication-Results': 'mx.cloudflare.net; dkim=pass header.i=@gmail.com header.s=20230601'
  });
  assert.strictEqual(verifyAuthenticationResults(headersValidDkim, allowedList, true), true);

  const headersFailedSpf = new Headers({
    'Authentication-Results': 'mx.cloudflare.net; spf=fail (domain of sltnet.lk does not designate 198.51.100.1 as permitted sender)'
  });
  assert.strictEqual(verifyAuthenticationResults(headersFailedSpf, allowedList, true), false);

  const headersSpoofedDomain = new Headers({
    'Authentication-Results': 'mx.cloudflare.net; spf=pass (domain of attacker.com designates 192.0.2.1 as permitted sender)'
  });
  assert.strictEqual(verifyAuthenticationResults(headersSpoofedDomain, allowedList, true), false);
  console.log('✓ Authentication-Results security verification passed');

  console.log('--- TEST 5: Proxy Recipient Regex Parsing ---');
  const clientB64 = toBase64Url('client@example.com');
  const aliasB64 = toBase64Url('host@ramyachandrachambers.com');
  const proxyAddress = `reply+${clientB64}.${aliasB64}.${sig}@ramyachandrachambers.com`;
  const match = proxyAddress.match(/^reply\+([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\.([a-fA-F0-9]+)@/);
  assert(match !== null, 'Regex should match proxy address');
  assert.strictEqual(match[1], clientB64);
  assert.strictEqual(match[2], aliasB64);
  assert.strictEqual(match[3], sig);
  console.log('✓ Proxy address regex parsing passed');

  console.log('--- TEST 6: Outbound New Compose Patterns ---');
  // Pattern A: send+
  const sendAddr = 'send+john.doe=gmail.com@ramyachandrachambers.com';
  const sendMatch = sendAddr.match(/^send\+([^@]+)@/);
  assert(sendMatch !== null);
  const targetEmail = sendMatch[1].replace('=', '@');
  assert.strictEqual(targetEmail, 'john.doe@gmail.com');

  // Pattern B: [TO: ... | FROM: ...]
  const subj1 = '[TO: client@test.com | FROM: deeds@ramyachandrachambers.com] Regarding Property Deed';
  const matchSubj1 = subj1.match(/^\[TO:\s*([^\]|]+?)\s*(?:\|\s*FROM:\s*([^\]]+?)\s*)?\]\s*(.*)$/i);
  assert(matchSubj1 !== null);
  assert.strictEqual(matchSubj1[1].trim(), 'client@test.com');
  assert.strictEqual(matchSubj1[2].trim(), 'deeds@ramyachandrachambers.com');
  assert.strictEqual(matchSubj1[3].trim(), 'Regarding Property Deed');

  // Pattern C: [TO: ...]
  const subj2 = '[TO: client@test.com] Notice of Filing';
  const matchSubj2 = subj2.match(/^\[TO:\s*([^\]|]+?)\s*(?:\|\s*FROM:\s*([^\]]+?)\s*)?\]\s*(.*)$/i);
  assert(matchSubj2 !== null);
  assert.strictEqual(matchSubj2[1].trim(), 'client@test.com');
  assert.strictEqual(matchSubj2[2], undefined);
  assert.strictEqual(matchSubj2[3].trim(), 'Notice of Filing');
  console.log('✓ Outbound compose patterns passed');

  console.log('\n====================================');
  console.log('ALL ROUTER UNIT TESTS PASSED (6/6)');
  console.log('====================================');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
