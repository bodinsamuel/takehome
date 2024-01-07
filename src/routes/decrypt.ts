import { FastifyPluginCallback } from 'fastify';
import { decryptJsonFields } from '../common/crypto.js';
import { serverError, validationError } from '../common/errors.js';

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

    try {
      const decrypted = decryptJsonFields(body);

      return res.status(200).send(decrypted);
    } catch (err) {
      if (err instanceof Error && err.message === 'invalid_iv') {
        return validationError(res, 'Please provide an encrypted JSON');
      }

      return serverError(res);
    }
  });

  done();
};

export default fn;
