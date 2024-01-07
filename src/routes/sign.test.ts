import { describe, it, expect } from 'vitest';

describe('GET /sign', () => {
  it('should not exist', async () => {
    const res = await fetch('http://localhost:8080/sign');

    expect(await res.json()).toStrictEqual({
      error: {
        code: '404_not_found',
        reason: 'GET /sign',
      },
    });
  });
});

describe('POST /sign', () => {
  it('should enforce missing JSON', async () => {
    const res = await fetch('http://localhost:8080/sign', {
      method: 'POST',
    });

    expect(await res.json()).toStrictEqual({
      error: {
        code: '400_invalid_request',
        reason: 'Provide a valid JSON',
      },
    });
  });

  it('should not allow bad content/type', async () => {
    const res = await fetch('http://localhost:8080/sign', {
      method: 'POST',
      body: 'foobar',
    });

    expect(await res.json()).toStrictEqual({
      error: {
        code: '500_server_error', // Could be handled better
      },
    });
  });

  it('should not allow bad JSON', async () => {
    const res = await fetch('http://localhost:8080/sign', {
      method: 'POST',
      body: 'foobar',
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(await res.json()).toStrictEqual({
      error: {
        code: '400_invalid_request',
        reason: 'Please provide a valid payload',
      },
    });
  });

  it('should sign JSON', async () => {
    const res = await fetch('http://localhost:8080/sign', {
      method: 'POST',
      body: '{"foo":"bar"}',
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(await res.json()).toStrictEqual({
      data: { foo: 'bar' },
      signature: expect.any(String),
    });
  });
});
