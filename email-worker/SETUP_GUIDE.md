# Bidirectional Email Routing & Transparent Reply-Masking System
**Domain:** `ramyachandrachambers.com`  
**Chambers Mailbox (Primary):** `ramyachndra@sltnet.lk` (SLT Webmail)  
**Public Chambers Alias:** `host@ramyachandrachambers.com` (and any `*@ramyachandrachambers.com`)  
**Technology:** Cloudflare Email Workers (`cloudflare:email`), Web Crypto API, `postal-mime`, Resend / Brevo Outbound API

---

## 1. System Architecture

```mermaid
flowchart TD
    subgraph Inbound Flow
        A["External Client<br>(Gmail/Outlook/Yahoo)"] -->|Emails host@ramyachandrachambers.com| B["Cloudflare MX Edge"]
        B -->|Intercepts & injects HMAC Reply-To| C["Cloudflare Email Worker<br>(ramyachandra-email-router)"]
        C -->|message.forward()| D["SLT Mail Server<br>(ramyachndra@sltnet.lk)"]
    end

    subgraph Outbound Reply Flow
        D -->|User clicks 'Reply' in SLT Mail| E["Recipient:<br>reply+client.alias.hmac@ramyachandrachambers.com"]
        E -->|Intercepts reply| F["Cloudflare Email Worker"]
        F -->|1. Verify Whitelist & SPF/DKIM<br>2. Verify HMAC Signature<br>3. Strip SLTnet metadata| G["Outbound Dispatcher<br>(Resend / Brevo API)"]
        G -->|From: host@ramyachandrachambers.com| A
    end
```

---

## 2. Prerequisites

1. **Cloudflare Account**: `ramyachandrachambers.com` DNS managed on Cloudflare.
2. **Node.js 18+** installed locally.
3. **Transactional Outbound API Key** (Free Tier):
   - **Resend** (Recommended, 3,000 emails/month free): [https://resend.com](https://resend.com)
   - **Brevo** (Sendinblue, 300 emails/day free): [https://brevo.com](https://brevo.com)

---

## 3. Step-by-Step Deployment Instructions

### Step 3.1: Install Dependencies & Verify Build
Open PowerShell / Terminal in `email-worker/`:
```bash
cd D:\ANTIGRAVITY\website\email-worker
npm install
npm run typecheck
```
*Expected output: zero errors (`tsc --noEmit` exits cleanly).*

### Step 3.2: Configure Cloudflare Secrets
Run the following commands using the Wrangler CLI:

1. **Generate and set `HMAC_SECRET`** (cryptographically secure 64-character random key):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the generated string, then execute:
   ```bash
   npx wrangler secret put HMAC_SECRET
   ```
   *(Paste the 64-char string when prompted)*.

2. **Set Primary Outbound Provider Key (`RESEND_API_KEY`)**:
   ```bash
   npx wrangler secret put RESEND_API_KEY
   ```
   *(Paste your Resend API key `re_...`)*.

3. **Set Fallback Outbound Provider Key (`BREVO_API_KEY`)** (Optional but recommended):
   ```bash
   npx wrangler secret put BREVO_API_KEY
   ```
   *(Paste your Brevo API key `xkeysib-...`)*.

### Step 3.3: Deploy the Worker to Cloudflare Edge
```bash
npx wrangler deploy
```
*Expected output: `Uploaded ramyachandra-email-router ... Current Version ID: ...`*

---

## 4. Cloudflare Email Routing Setup

1. Open **Cloudflare Dashboard** -> Select **`ramyachandrachambers.com`** -> Click **Email Routing** in the left menu.
2. **Enable Email Routing** if not already enabled. Cloudflare will automatically verify MX and SPF records.
3. In the **Destination Addresses** tab:
   - Click **Add destination address**.
   - Enter `ramyachndra@sltnet.lk`.
   - Check the SLT mailbox for the Cloudflare verification email and click the confirmation link.
   - *(Optional)* Add a backup Gmail address (e.g., `backup@gmail.com`) and verify it.
4. In the **Routing Rules** tab:
   - Click **Create rule**.
   - **Match**: `Catch-all rule` (matches all incoming emails to `*@ramyachandrachambers.com`).
   - **Action**: `Send to a Worker`.
   - **Destination**: Select `ramyachandra-email-router`.
   - Click **Save**.

---

## 5. DNS Records Verification

Ensure your Cloudflare DNS table includes the records listed in [`dns-records.txt`](file:///D:/ANTIGRAVITY/website/email-worker/dns-records.txt):

1. **SPF Record (TXT @)**:
   ```
   v=spf1 include:_spf.mx.cloudflare.net include:spf.brevo.com include:_spf.resend.com ~all
   ```
2. **DMARC Record (TXT _dmarc)**:
   ```
   v=DMARC1; p=quarantine; adkim=r; aspf=r; pct=100; rua=mailto:ramyachndra@sltnet.lk; ruf=mailto:ramyachndra@sltnet.lk; fo=1;
   ```
3. **DKIM Record (from Resend / Brevo)**:
   - In Resend Dashboard -> Domains -> Add `ramyachandrachambers.com`.
   - Copy the `resend._domainkey` CNAME record into Cloudflare DNS.

---

## 6. Daily Usage Instructions for SLT Mail (`ramyachndra@sltnet.lk`)

### 6.1 Receiving & Replying to Client Inquiries
1. When a client emails `host@ramyachandrachambers.com` (or any chambers address), Cloudflare forwards the email directly to `ramyachndra@sltnet.lk`.
2. Inside SLT Mail, simply hit the normal **Reply** button.
3. The `To:` field is automatically set to the signed proxy address:
   `reply+<client_b64>.<alias_b64>.<hmac>@ramyachandrachambers.com`
4. Type your legal response, attach documents/deeds as needed, and click **Send**.
5. **Client's View**:
   - The client receives the email from `"Ramyachandra Gunasekera Chambers" <host@ramyachandrachambers.com>`.
   - The original thread headers (`In-Reply-To`, `References`) are preserved so the email stays in the same conversation thread.
   - `ramyachndra@sltnet.lk` and all SLTnet internal routing headers are **100% invisible**.

### 6.2 Composing a Brand-New Outbound Email from SLT Mail
To initiate a new email thread with a client directly from your SLT mailbox:

#### Method A: Direct Address Syntax (`send+`)
In SLT Mail, compose a new email and set the recipient to:
```
send+<client_username>=<client_domain>@ramyachandrachambers.com
```
*Example:* To email `client.name@gmail.com`:
```
To: send+client.name=gmail.com@ramyachandrachambers.com
Subject: Legal Deed Consultation - Ramyachandra Gunasekera Chambers
```

#### Method B: Subject Tag Syntax
Send an email to `host@ramyachandrachambers.com` with the destination encoded in the subject line:
```
To: host@ramyachandrachambers.com
Subject: [TO: client.name@gmail.com] Legal Deed Consultation
```
*Custom From Alias Example:*
```
Subject: [TO: client.name@gmail.com | FROM: deeds@ramyachandrachambers.com] Title Search Report
```
The router will strip the `[TO: ...]` tag before delivering the email to the client, setting `From:` to the specified chambers address.

---

## 7. Security Architecture & Controls

| Security Threat | Mitigation Implemented |
|---|---|
| **Eavesdropping / Replay Attacks** | HMAC-SHA256 signature generated over `<client>.<alias>` using secret key; verified in constant time with `crypto.subtle.verify`. |
| **Address Spoofing** | Whitelist check verifies `message.from` strictly matches `ALLOWED_SENDERS`. |
| **Relay Hijacking** | Cloudflare MX `Authentication-Results` checked for `spf=pass` or `dkim=pass` matching authorized domain. |
| **Header Leakage** | All SLT Mail servers, internal IPs, and `X-Originating-IP` headers are stripped. Email is dispatched through clean API. |
| **Mail Loops / Auto-Responders** | `X-Loop-Guard: ramyachandrachambers-email-worker` and `Auto-Submitted` headers terminate recursive loops immediately. |
| **Attachment Size / Memory Limits** | 16 KB chunked binary conversion prevents call stack overflow; supports attachments up to 25 MB. |
