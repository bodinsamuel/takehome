import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

// ESM do not have __dirname
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(path.join(filename, '..', '..'));

// Key for signing
const PRIVATE_KEY_PATH = path.join(dirname, 'private-key.pem');
// Key for encryption
const AES_KEY_PATH = path.join(dirname, 'private-key');

export let privateKey: string | undefined;
export let aesKey: Buffer | undefined;

export async function read(): Promise<
  { aes: Buffer; rsa: string } | undefined
> {
  try {
    const contentAes = await fs.readFile(AES_KEY_PATH);
    const contentRsa = await fs.readFile(PRIVATE_KEY_PATH);
    return { aes: contentAes, rsa: contentRsa.toString() };
  } catch (err) {
    console.warn('Cant read private key');
    if (!(err instanceof Error) || (err as any).code !== 'ENOENT') {
      console.error(err);
    }
  }
}

export async function generate(): Promise<{ aes: Buffer; rsa: string }> {
  console.warn('Generating key');
  const key = crypto.randomBytes(32);

  const rsa = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  });

  try {
    await fs.writeFile(AES_KEY_PATH, key);
    await fs.writeFile(PRIVATE_KEY_PATH, rsa.privateKey);
  } catch (err) {
    console.error('Cant write private key', err);
    process.exit();
  }

  return { aes: key, rsa: rsa.privateKey };
}

export async function readOrGenerate(): Promise<void> {
  console.log('⏳ Key bootstrap');

  let key = await read();
  if (!key) {
    key = await generate();
  }

  aesKey = key.aes;
  privateKey = key.rsa;

  console.log('✅ Key bootstrap');
}
