import { FastifyPluginAsync } from 'fastify';
import root from './root.js';
import encrypt from './encrypt.js';
import decrypt from './decrypt.js';
import sign from './sign.js';
import verify from './verify.js';

export const routes: FastifyPluginAsync = async (f) => {
  await f.register(encrypt, { prefix: '/' });
  await f.register(decrypt, { prefix: '/' });
  await f.register(sign, { prefix: '/' });
  await f.register(verify, { prefix: '/' });

  await f.register(root);
};
