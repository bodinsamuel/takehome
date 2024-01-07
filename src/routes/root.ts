import { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get('/', function (_req, res) {
    return res.status(200).send({
      root: true,
    });
  });

  done();
};

export default fn;
