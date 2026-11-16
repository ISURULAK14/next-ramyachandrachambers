import PostalMime from 'postal-mime';

/**
 * Cloudflare Worker Environment Interface
 */
export interface Env {
  DOMAIN: string;
  PRIMARY_RECIPIENT: string;
  BACKUP_RECIPIENT?: string;
  ALLOWED_SENDERS: string;
  DEFAULT_SENDER_NAME?: string;
  DEFAULT_OUTBOUND_ALIAS?: string;
  REQUIRE_AUTH_RESULTS?: string;
  HMAC_SECRET: string;
  RESEND_API_KEY?: string;
  BREVO_API_KEY?: string;
}

/**
 * Universal safe base64url encoding (UTF-8 safe, no padding)
 */
export function toBase64Url(str: string): string {
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

/**
 * Universal safe base64url decoding (UTF-8 safe, handles missing padding)
 */
export function fromBase64Url(b64url: string): string {
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

/**
 * Generate HMAC-SHA256 signature using Web Crypto API
 */
export async function signHmac(secret: string, data: string): Promise<string> {
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

/**
 * Verify HMAC-SHA256 in constant time using crypto.subtle.verify
 */
export async function verifyHmac(secret: string, data: string, hexSignature: string): Promise<boolean> {
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

/**
 * Convert ArrayBuffer to Base64 in safe 16KB chunks to prevent stack overflow
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 16384;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

/**
 * Email validation regex (RFC 5322 compliant subset)
 */
export function isValidEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

/**
 * Check if the sender is authorized by checking the configured whitelist
 */
export function isAllowedSender(senderEmail: string, allowedListStr: string): boolean {
  const allowed = allowedListStr
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(senderEmail.toLowerCase().trim());
}

/**
 * Parse and verify Authentication-Results header injected by Cloudflare MX
 */
export function verifyAuthenticationResults(
  headers: Headers,
  allowedSenders: string[],
  requireAuth: boolean
): boolean {
  if (!requireAuth) return true;

  const authHeader = (
    headers.get('Authentication-Results') ||
    headers.get('authentication-results') ||
    ''
  ).toLowerCase();

  if (!authHeader) {
    return false;
  }

  // Check if SPF, DKIM, or ARC passed
  const hasSpfPass = /\bspf=pass\b/.test(authHeader);
  const hasDkimPass = /\bdkim=pass\b/.test(authHeader);
  const hasArcPass = /\barc=pass\b/.test(authHeader);

  if (!hasSpfPass && !hasDkimPass && !hasArcPass) {
    return false;
  }

  // Extract domains from allowed senders
  const allowedDomains = allowedSenders
    .map(s => s.split('@')[1]?.trim().toLowerCase())
    .filter(Boolean);

  // Verify that an allowed sender domain was authenticated
  const isDomainAuthenticated = allowedDomains.some(dom => authHeader.includes(dom));
  return isDomainAuthenticated;
}

export interface AttachmentItem {
  filename: string;
  content: string; // base64
  mimeType: string;
}

export interface OutboundPayload {
  fromName: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  html?: string;
  text?: string;
  inReplyTo?: string;
  references?: string;
  attachments?: AttachmentItem[];
}

/**
 * Dispatch email via Resend API
 */
async function sendViaResend(
  apiKey: string,
  payload: OutboundPayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${payload.fromName} <${payload.fromEmail}>`,
        to: [payload.toEmail],
        subject: payload.subject,
        html: payload.html || undefined,
        text: payload.text || undefined,
        headers: {
          ...(payload.inReplyTo ? { 'In-Reply-To': payload.inReplyTo } : {}),
          ...(payload.references ? { References: payload.references } : {}),
          'X-Loop-Guard': 'ramyachandrachambers-email-worker'
        },
        attachments: payload.attachments?.map(att => ({
          filename: att.filename,
          content: att.content
        }))
      })
    });

    if (res.ok) {
      const data = (await res.json()) as { id?: string };
      return { success: true, id: data.id };
    }

    const errText = await res.text();
    return { success: false, error: `Resend HTTP ${res.status}: ${errText}` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Resend Network Error: ${msg}` };
  }
}

/**
 * Dispatch email via Brevo (Sendinblue) API v3
 */
async function sendViaBrevo(
  apiKey: string,
  payload: OutboundPayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: payload.fromName,
          email: payload.fromEmail
        },
        to: [{ email: payload.toEmail }],
        subject: payload.subject,
        htmlContent: payload.html || undefined,
        textContent: payload.text || undefined,
        headers: {
          ...(payload.inReplyTo ? { 'In-Reply-To': payload.inReplyTo } : {}),
          ...(payload.references ? { References: payload.references } : {}),
          'X-Loop-Guard': 'ramyachandrachambers-email-worker'
        },
        attachment: payload.attachments?.map(att => ({
          name: att.filename,
          content: att.content
        }))
      })
    });

    if (res.ok) {
      const data = (await res.json()) as { messageId?: string };
      return { success: true, id: data.messageId };
    }

    const errText = await res.text();
    return { success: false, error: `Brevo HTTP ${res.status}: ${errText}` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Brevo Network Error: ${msg}` };
  }
}

/**
 * Dual Outbound Dispatcher with seamless failover
 */
export async function dispatchOutbound(
  env: Env,
  payload: OutboundPayload
): Promise<{ success: boolean; provider: string; error?: string }> {
  // 1. Try Resend if configured
  if (env.RESEND_API_KEY && env.RESEND_API_KEY.trim()) {
    const res = await sendViaResend(env.RESEND_API_KEY.trim(), payload);
    if (res.success) {
      return { success: true, provider: 'resend' };
    }
    console.error('Primary provider Resend failed. Attempting fallback Brevo...', res.error);
  }

  // 2. Try Brevo fallback if configured
  if (env.BREVO_API_KEY && env.BREVO_API_KEY.trim()) {
    const res = await sendViaBrevo(env.BREVO_API_KEY.trim(), payload);
    if (res.success) {
      return { success: true, provider: 'brevo' };
    }
    console.error('Fallback provider Brevo failed:', res.error);
    return { success: false, provider: 'none', error: res.error };
  }

  return {
    success: false,
    provider: 'none',
    error: 'No transactional email provider (RESEND_API_KEY or BREVO_API_KEY) configured or available.'
  };
}

/**
 * Send failure notification back to primary recipient
 */
async function notifyFailure(
  env: Env,
  targetRecipient: string,
  failedTo: string,
  subject: string,
  errorMessage: string
): Promise<void> {
  const failurePayload: OutboundPayload = {
    fromName: 'System Mailer Daemon',
    fromEmail: env.DEFAULT_OUTBOUND_ALIAS || `info@${env.DOMAIN}`,
    toEmail: targetRecipient,
    subject: `[DELIVERY FAILURE] Could not send email to ${failedTo}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #b91c1c; margin-top: 0;">⚠️ Outbound Email Delivery Failed</h2>
        <p>An email outbound dispatch could not be completed by the Chambers mail router.</p>
        <table style="border-collapse: collapse; width: 100%; margin: 15px 0;">
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; width: 140px;">Intended Recipient:</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${failedTo}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Subject:</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${subject}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Timestamp:</td><td style="padding: 8px; border: 1px solid #cbd5e1;">${new Date().toISOString()}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Error Detail:</td><td style="padding: 8px; border: 1px solid #cbd5e1; color: #b91c1c;">${errorMessage}</td></tr>
        </table>
        <p style="font-size: 0.9em; color: #64748b;">Please check your RESEND_API_KEY or BREVO_API_KEY settings or verify domain DNS records in Cloudflare.</p>
      </div>
    `,
    text: `DELIVERY FAILURE\nCould not deliver email to: ${failedTo}\nSubject: ${subject}\nError: ${errorMessage}\nTime: ${new Date().toISOString()}`
  };

  // Attempt to notify via whichever provider works
  await dispatchOutbound(env, failurePayload);
}

/**
 * Main Cloudflare Email Worker Handler
 */
export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    const rawTo = message.to.toLowerCase().trim();
    const rawFrom = message.from.toLowerCase().trim();
    const loopGuard = message.headers.get('X-Loop-Guard') || message.headers.get('x-loop-guard');
    const autoSubmitted = message.headers.get('Auto-Submitted') || message.headers.get('auto-submitted');

    // 1. Loop Prevention Guard
    if (loopGuard === 'ramyachandrachambers-email-worker' || (autoSubmitted && autoSubmitted !== 'no')) {
      console.warn(`Loop or automated message detected. Dropping silently to prevent cascades. From: ${rawFrom}`);
      return;
    }

    const domain = (env.DOMAIN || 'ramyachandrachambers.com').toLowerCase().trim();
    const primaryRecipient = env.PRIMARY_RECIPIENT.trim();
    const backupRecipient = env.BACKUP_RECIPIENT ? env.BACKUP_RECIPIENT.trim() : '';
    const allowedSendersList = env.ALLOWED_SENDERS.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const requireAuth = env.REQUIRE_AUTH_RESULTS !== 'false';
    const defaultSenderName = env.DEFAULT_SENDER_NAME || 'Ramyachandra Gunasekera Chambers';
    const defaultOutboundAlias = env.DEFAULT_OUTBOUND_ALIAS || `info@${domain}`;

    // Read full raw MIME message for body/attachment parsing
    const rawBuffer = await new Response(message.raw).arrayBuffer();
    const parser = new PostalMime();
    const parsed = await parser.parse(rawBuffer);

    // =========================================================================
    // CASE A: OUTBOUND REPLY (Recipient starts with "reply+")
    // =========================================================================
    if (rawTo.startsWith('reply+')) {
      const match = rawTo.match(/^reply\+([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\.([a-fA-F0-9]+)@/);
      if (!match) {
        message.setReject('550 Invalid signed reply proxy format');
        return;
      }

      const [, clientB64, aliasB64, hmacHex] = match;

      // Check 1: Sender Whitelist (both envelope sender and MIME From)
      const mimeFromAddress = parsed.from?.address?.toLowerCase().trim() || '';
      if (!isAllowedSender(rawFrom, env.ALLOWED_SENDERS) || !isAllowedSender(mimeFromAddress, env.ALLOWED_SENDERS)) {
        console.error(`Unauthorized sender rejected: envelope=${rawFrom}, mimeFrom=${mimeFromAddress}`);
        message.setReject('550 Unauthorized reply sender address');
        return;
      }

      // Check 2: Authentication-Results Verification (SPF / DKIM / ARC)
      if (!verifyAuthenticationResults(message.headers, allowedSendersList, requireAuth)) {
        console.error('Authentication check failed on inbound reply from authorized address');
        message.setReject('550 Inbound reply failed SPF/DKIM verification');
        return;
      }

      // Check 3: Constant-Time HMAC Signature Verification
      const dataToVerify = `${clientB64}.${aliasB64}`;
      const isValidHmac = await verifyHmac(env.HMAC_SECRET, dataToVerify, hmacHex.toLowerCase());
      if (!isValidHmac) {
        console.error('Tampered or invalid HMAC signature on reply proxy address');
        message.setReject('550 Invalid or tampered proxy signature');
        return;
      }

      // Decode target client address and original alias
      let targetClientEmail: string;
      let fromAlias: string;
      try {
        targetClientEmail = fromBase64Url(clientB64).trim().toLowerCase();
        fromAlias = fromBase64Url(aliasB64).trim().toLowerCase();
      } catch {
        message.setReject('550 Malformed base64url encoding');
        return;
      }

      if (!isValidEmail(targetClientEmail)) {
        message.setReject('550 Decoded client address is invalid');
        return;
      }

      // Ensure From alias belongs to chambers domain
      if (!fromAlias.endsWith(`@${domain}`)) {
        fromAlias = defaultOutboundAlias;
      }

      // Convert attachments to base64
      const attachments: AttachmentItem[] = (parsed.attachments || []).map(att => ({
        filename: att.filename || 'attachment',
        content: arrayBufferToBase64(att.content as ArrayBuffer),
        mimeType: att.mimeType || 'application/octet-stream'
      }));

      // Preserve In-Reply-To and References for conversation threading
      const inReplyTo = parsed.inReplyTo || undefined;
      const references = parsed.references || undefined;

      const outboundPayload: OutboundPayload = {
        fromName: defaultSenderName,
        fromEmail: fromAlias,
        toEmail: targetClientEmail,
        subject: parsed.subject || 'Re: Legal Consultation',
        html: parsed.html || undefined,
        text: parsed.text || undefined,
        inReplyTo,
        references,
        attachments
      };

      const dispatchResult = await dispatchOutbound(env, outboundPayload);
      if (!dispatchResult.success) {
        await notifyFailure(
          env,
          primaryRecipient,
          targetClientEmail,
          parsed.subject || '(no subject)',
          dispatchResult.error || 'Outbound provider dispatch error'
        );
        message.setReject(`451 Temporary outbound failure: ${dispatchResult.error}`);
        return;
      }

      console.log(`Successfully dispatched reply to ${targetClientEmail} via ${dispatchResult.provider}`);
      return;
    }

    // =========================================================================
    // CASE B: OUTBOUND NEW COMPOSE (Recipient starts with "send+" / "compose+" or custom Subject)
    // =========================================================================
    const subjectMatch = (parsed.subject || '').match(/^\[TO:\s*([^\]|]+?)\s*(?:\|\s*FROM:\s*([^\]]+?)\s*)?\]\s*(.*)$/i);
    const isSendOrCompose = rawTo.startsWith('send+') || rawTo.startsWith('compose+');

    if (isSendOrCompose || subjectMatch) {
      // Check 1: Whitelist
      const mimeFromAddress = parsed.from?.address?.toLowerCase().trim() || '';
      if (!isAllowedSender(rawFrom, env.ALLOWED_SENDERS) || !isAllowedSender(mimeFromAddress, env.ALLOWED_SENDERS)) {
        message.setReject('550 Unauthorized sender for outbound compose');
        return;
      }

      // Check 2: SPF / DKIM verification
      if (!verifyAuthenticationResults(message.headers, allowedSendersList, requireAuth)) {
        message.setReject('550 Outbound compose failed SPF/DKIM verification');
        return;
      }

      let targetClientEmail = '';
      let fromAlias = defaultOutboundAlias;
      let cleanSubject = parsed.subject || '';

      if (isSendOrCompose) {
        // e.g. send+john.doe=gmail.com@ramyachandrachambers.com or compose+john.doe=gmail.com@ramyachandrachambers.com
        const sendMatch = rawTo.match(/^(?:send|compose)\+([^@]+)@/);
        if (sendMatch) {
          targetClientEmail = sendMatch[1].replace('=', '@').trim().toLowerCase();
        }
      } else if (subjectMatch) {
        targetClientEmail = subjectMatch[1].trim().toLowerCase();
        if (subjectMatch[2]) {
          const customFrom = subjectMatch[2].trim().toLowerCase();
          if (customFrom.endsWith(`@${domain}`)) {
            fromAlias = customFrom;
          }
        }
        cleanSubject = subjectMatch[3].trim() || 'Legal Notice - Ramyachandra Gunasekera Chambers';
      }

      if (!isValidEmail(targetClientEmail)) {
        message.setReject('550 Invalid target client email specified');
        return;
      }

      const attachments: AttachmentItem[] = (parsed.attachments || []).map(att => ({
        filename: att.filename || 'attachment',
        content: arrayBufferToBase64(att.content as ArrayBuffer),
        mimeType: att.mimeType || 'application/octet-stream'
      }));

      const outboundPayload: OutboundPayload = {
        fromName: defaultSenderName,
        fromEmail: fromAlias,
        toEmail: targetClientEmail,
        subject: cleanSubject,
        html: parsed.html || undefined,
        text: parsed.text || undefined,
        attachments
      };

      const dispatchResult = await dispatchOutbound(env, outboundPayload);
      if (!dispatchResult.success) {
        await notifyFailure(
          env,
          primaryRecipient,
          targetClientEmail,
          cleanSubject,
          dispatchResult.error || 'Outbound compose dispatch error'
        );
        message.setReject(`451 Outbound compose failure: ${dispatchResult.error}`);
        return;
      }

      console.log(`Successfully dispatched new compose to ${targetClientEmail} via ${dispatchResult.provider}`);
      return;
    }

    // =========================================================================
    // CASE C: INBOUND CLIENT EMAIL (Client -> alias@ramyachandrachambers.com)
    // =========================================================================
    // Generate tamper-proof signed Reply-To proxy address
    const clientB64 = toBase64Url(rawFrom);
    const aliasB64 = toBase64Url(rawTo);
    const dataToSign = `${clientB64}.${aliasB64}`;
    const hmacHex = await signHmac(env.HMAC_SECRET, dataToSign);

    const proxyAddress = `reply+${clientB64}.${aliasB64}.${hmacHex}@${domain}`;

    // Construct headers to inject into forwarded email
    const forwardHeaders = new Headers();
    forwardHeaders.set('Reply-To', proxyAddress);
    forwardHeaders.set('X-Original-Sender', rawFrom);
    forwardHeaders.set('X-Original-To', rawTo);
    forwardHeaders.set('X-Loop-Guard', 'ramyachandrachambers-email-worker');

    // Forward to primary recipient (SLT Mail: ramyachandra@sltnet.lk)
    try {
      await message.forward(primaryRecipient, forwardHeaders);
      console.log(`Inbound email from ${rawFrom} forwarded to ${primaryRecipient} with Reply-To: ${proxyAddress}`);
    } catch (err: unknown) {
      console.error(`Failed to forward inbound message to primary ${primaryRecipient}:`, err);
      message.setReject('451 Unable to forward to primary destination');
      return;
    }

    // Forward to optional backup recipient (e.g. Gmail)
    if (backupRecipient && isValidEmail(backupRecipient) && backupRecipient !== primaryRecipient) {
      try {
        await message.forward(backupRecipient, forwardHeaders);
        console.log(`Inbound email forwarded to backup ${backupRecipient}`);
      } catch (err: unknown) {
        console.warn(`Optional backup forward to ${backupRecipient} skipped or failed:`, err);
      }
    }
  }
};
