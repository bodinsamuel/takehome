import { FastifyPluginAsync } from 'fastify';
import root from './root.js';

export const routes: FastifyPluginAsync = async (f) => {
  // await f.register(decrypt, { prefix: '/' });
  // await f.register(encrypt, { prefix: '/0' });
  // await f.register(sign, { prefix: '/0' });
  // await f.register(verify, { prefix: '/0' });

  await f.register(root);
};
