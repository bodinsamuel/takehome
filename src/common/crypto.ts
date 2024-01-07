import crypto from 'node:crypto';
import { aesKey, privateKey } from './key.js';

// We use AES with an IV because it's faster and more appropriate for bulk encryption (in the scenario of the endpoint being intensively used)
const ALGO = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

// Sign
const ALGO_SIGN = 'SHA256';

export function encryptJsonFields(
  body: Record<string, any>
): Record<string, string> {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, aesKey!, iv);
  const ivStr = iv.toString('hex');

  const encrypted: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    let msg = cipher.update(value);
    msg = Buffer.concat([msg, cipher.final()]);

    // We use one IV for all messages but the task does not allow us to append the iv in the payload
    // so we append it to the field values themselves
    // This could allow us to have one IV per field but it's highly inefficient
    encrypted[key] = `${ivStr}:${msg.toString('hex')}`;
  }

  return encrypted;
}

export function decryptJsonFields(
  body: Record<string, any>,
  allowPartial: boolean
): Record<string, string> {
  const decrypted: Record<string, string> = {};

  for (const [key, value] of Object.entries(body)) {
    // Because we couldn't one IV we need to repeat this operation per field
    // Clearly not efficient but good enough for small payload
    // If an unencrypted message contains ":" it will create a false positive
    const [iv, msg] = value.split(':');
    if (!allowPartial && (!iv || !msg)) {
      throw new Error('invalid_iv');
    }
    if (!msg) {
      decrypted[key] = iv;
      continue;
    }

    const ivBuffer = Buffer.from(iv, 'hex');
    const encryptedBuffer = Buffer.from(msg, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey!, ivBuffer);

    let next = decipher.update(encryptedBuffer);
    next = Buffer.concat([next, decipher.final()]);

    decrypted[key] = next.toString();
  }

  return decrypted;
}

export function sign(data: Record<string, any>): string {
  return crypto
    .sign(ALGO_SIGN, Buffer.from(JSON.stringify(data)), privateKey!)
    .toString('base64');
}

export function verify(data: Record<string, any>, signature: string): boolean {
  return crypto.verify(
    ALGO_SIGN,
    Buffer.from(JSON.stringify(data)),
    privateKey!,
    Buffer.from(signature, 'base64')
  );
}
