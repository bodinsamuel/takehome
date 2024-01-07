import { FastifyPluginCallback } from 'fastify';
import { validationError } from '../common/errors.js';
import { decryptJsonFields, sign } from '../common/crypto.js';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post('/sign', function (req, res) {
    const body = req.body as Record<string, any>;

    // Better safe than sorry, otherwise Zod could be handy here
    if (!body || typeof body !== 'object') {
      return validationError(res, 'Provide a valid JSON');
    }

    // Could be considered a valid scenario
    if (Object.keys(body).length <= 0) {
      return validationError(res, 'Empty JSON');
    }

    // We assume the JSON or part of the JSON has been encrypted
    const decrypted = decryptJsonFields(body, true);
    res.status(200).send({
      signature: sign(decrypted),
      data: body,
    });
  });

  done();
};

export default fn;
