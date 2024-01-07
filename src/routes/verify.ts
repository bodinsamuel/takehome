import { FastifyPluginCallback } from 'fastify';
import { validationError } from '../common/errors.js';
import { decryptJsonFields, verify } from '../common/crypto.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post('/verify', function (req, res) {
    const body = req.body as Record<string, any>;

    // Better safe than sorry, otherwise Zod could be handy here
    if (!body || typeof body !== 'object') {
      return validationError(res, 'Provide a valid JSON');
    }
    // At this point we would be better off using Zod
    if (
      !('signature' in body) ||
      !('data' in body) ||
      typeof body.signature !== 'string'
    ) {
      return validationError(res, 'Provide a valid encrypted JSON');
    }

    // We assume the JSON or part of the JSON has been encrypted
    const decrypted = decryptJsonFields(body.data, true);

    const isVerified = verify(decrypted, body.signature);
    if (isVerified) {
      return res.status(204).send();
    }

    return validationError(res, "Signature doesn't match");
  });

  done();
};

export default fn;
