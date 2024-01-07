import crypto from 'node:crypto';
import { privateKey } from './key.js';

const ALGO = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

export function encryptJsonFields(
  body: Record<string, any>
): Record<string, string> {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, privateKey!, iv);
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
  body: Record<string, any>
): Record<string, string> {
  const decrypted: Record<string, string> = {};

  for (const [key, value] of Object.entries(body)) {
    // Because we couldn't one IV we need to repeat this operation per field
    // Clearly not efficient but good enough for small payload
    const [iv, msg] = value.split(':');
    if (!iv || !msg) {
      throw new Error('invalid_iv');
    }

    const ivBuffer = Buffer.from(iv, 'hex');
    const encryptedBuffer = Buffer.from(msg, 'hex');

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      privateKey!,
      ivBuffer
    );

    let next = decipher.update(encryptedBuffer);
    next = Buffer.concat([next, decipher.final()]);

    decrypted[key] = next.toString();
  }

  return decrypted;
}
