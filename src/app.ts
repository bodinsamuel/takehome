import rawBody from 'fastify-raw-body';

import { notFound, serverError, validationError } from './common/errors.js';
import { routes } from './routes/index.js';

import type {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyServerOptions,
} from 'fastify';

export default async (f: FastifyInstance, opts: FastifyPluginOptions) => {
  // Log incoming
  f.addHook('onRequest', (req, _res, done) => {
    console.log(`#${req.id} <- ${req.method} ${req.url}`);
    done();
  });

  // Log outgoing
  f.addHook('onResponse', (_, res, done) => {
    console.log(`#${res.request.id} -> ${res.statusCode}`);
    done();
  });

  // Handle unexpected error as server error
  f.setErrorHandler(function (error, _req, res) {
    // Catch json parsing error
    if ((error as any).statusCode === 400) {
      return validationError(res, 'Please provide a valid payload');
    }

    // any other error are 500
    console.error(error instanceof Error ? error.message : error);
    return serverError(res);
  });

  // Handle 404
  f.setNotFoundHandler(function (req, res) {
    return notFound(res, `${req.method} ${req.url}`);
  });

  // Enable passing raw body to be able to decode it manually in the next one
  await f.register(rawBody, {
    field: 'rawBody',
    global: false,
    encoding: 'utf8',
    runFirst: true,
  });

  f.removeAllContentTypeParsers();

  // Decode JSON with custom settings
  f.addContentTypeParser(
    'application/json',
    { parseAs: 'string', bodyLimit: 1097152 },
    function (_req, body, done) {
      try {
        const json = JSON.parse(body as string);
        done(null, json);
      } catch (err: unknown) {
        // Due to fastify limitation we can't answer directly here
        (err as any).statusCode = 400;
        done(err as any, undefined);
      }
    }
  );

  await routes(f, opts);
};

export const options: FastifyServerOptions = {
  trustProxy: true,
  logger: false,
};
