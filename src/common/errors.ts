import { FastifyReply } from 'fastify';

export async function notFound(
  res: FastifyReply,
  message?: string
): Promise<void> {
  const err = {
    error: {
      code: '404_not_found',
      reason: message,
    },
  };
  return res.status(404).send(err);
}

export async function serverError(res: FastifyReply): Promise<void> {
  const err = {
    error: {
      code: '500_server_error',
    },
  };
  return res.status(500).send(err);
}

export async function validationError(
  res: FastifyReply,
  message: string
): Promise<void> {
  const err = {
    error: {
      code: '400_invalid_request',
      reason: message,
    },
  };
  return res.status(400).send(err);
}
