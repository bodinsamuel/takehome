import { FastifyPluginCallback } from 'fastify';
import { decryptJsonFields } from '../common/crypto.js';
import { validationError } from '../common/errors.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post('/decrypt', function (req, res) {
    const body = req.body as Record<string, any>;

    // Better safe than sorry, otherwise Zod could be handy here
    if (!body || typeof body !== 'object') {
      return validationError(res, 'Provide a valid JSON');
    }

    // Could be considered a valid scenario
    if (Object.keys(body).length <= 0) {
      return validationError(res, 'Empty JSON');
    }

    const decrypted = decryptJsonFields(body);

    return res.status(200).send(decrypted);
  });

  done();
};

export default fn;
