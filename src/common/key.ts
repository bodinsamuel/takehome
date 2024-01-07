import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const KEY_PATH = 'private-key';

// ESM do not have __dirname
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(path.join(filename, '..'));
const fp = path.join(dirname, KEY_PATH);

export let privateKey: Buffer | undefined;

export async function read(): Promise<Buffer | undefined> {
  try {
    const content = await fs.readFile(fp);
    return content;
  } catch (err) {
    console.warn('Cant read private key');
    if (!(err instanceof Error) || (err as any).code !== 'ENOENT') {
      console.error(err);
    }
  }
}

export async function generate(): Promise<Buffer> {
  console.warn('Generating key');
  const key = crypto.randomBytes(32);

  try {
    await fs.writeFile(fp, key);
  } catch (err) {
    console.error('Cant write private key', err);
    process.exit();
  }

  return key;
}

export async function readOrGenerate(): Promise<void> {
  console.log('⏳ Key bootstrap');

  let key = await read();
  if (!key) {
    key = await generate();
  }

  privateKey = key;

  console.log('✅ Key bootstrap');
}
