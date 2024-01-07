import fastify from 'fastify';
import app from './app.js';
import { readOrGenerate } from './common/key.js';

const server = fastify();

// Register my app
void server.register(app);

server.listen({ port: 8080 }, async (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  await readOrGenerate();

  console.log(`Server listening at ${address}`);
});
