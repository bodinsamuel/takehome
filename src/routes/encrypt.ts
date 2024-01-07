import { FastifyPluginCallback } from 'fastify';
import { encryptJsonFields } from '../common/crypto.js';
import { validationError } from '../common/errors.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post('/encrypt', function (req, res) {
    const body = req.body as Record<string, any>;

    // Better safe than sorry, otherwise Zod could be handy here
    if (!body || typeof body !== 'object') {
      return validationError(res, 'Provide a valid JSON');
    }

    // Could be considered a valid scenario
    if (Object.keys(body).length <= 0) {
      return validationError(res, 'Empty JSON');
    }

    const encrypted = encryptJsonFields(body);

    return res.status(200).send(encrypted);
  });

  done();
};

export default fn;
